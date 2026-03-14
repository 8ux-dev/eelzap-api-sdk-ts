import { EelZapError, EelZapNetworkError } from './errors';
import { normalizePathPrefix } from './paths';
import { cleanParams } from './utils';
import type { ApiErrorPayload, QueryPrimitive } from './types/common';

export interface HttpClientConfig {
  apiKey: string;
  baseUrl: string;
  pathPrefix: string;
  fetch: typeof globalThis.fetch;
  defaultHeaders?: HeadersInit;
  timeout: number;
}

export interface HttpRequestOptions {
  params?: Record<string, QueryPrimitive | undefined>;
  headers?: HeadersInit;
  body?: BodyInit | null;
  contentType?: string;
}

/**
 * Minimal fetch-based HTTP client for the delivery API.
 *
 * @internal
 */
export class HttpClient {
  readonly #config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.#config = config;
  }

  async get<T>(
    path: string,
    options?: Omit<HttpRequestOptions, 'body' | 'contentType'>,
  ): Promise<T> {
    return this.#request<T>('GET', path, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'body'>,
  ): Promise<T> {
    return this.#request<T>('POST', path, this.#withJsonBody(body, options));
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'body'>,
  ): Promise<T> {
    return this.#request<T>('PATCH', path, this.#withJsonBody(body, options));
  }

  async put<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'body'>,
  ): Promise<T> {
    return this.#request<T>('PUT', path, this.#withJsonBody(body, options));
  }

  async delete<T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'body'>,
  ): Promise<T> {
    return this.#request<T>('DELETE', path, this.#withJsonBody(body, options));
  }

  async upload(url: string, body: BodyInit, headers?: HeadersInit): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.#config.timeout);

    try {
      const response = await this.#config.fetch(url, {
        method: 'PUT',
        body,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.toEelZapError(response);
      }
    } catch (error) {
      if (error instanceof EelZapError) {
        throw error;
      }

      throw new EelZapNetworkError(
        error,
        error instanceof Error ? error.message : 'Network request failed.',
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async request<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.get<T>(path, options);
  }

  async #request<T>(method: string, path: string, options?: HttpRequestOptions): Promise<T> {
    const prefix = normalizePathPrefix(this.#config.pathPrefix);
    const normalizedPath = path.replace(/^\/+/, '');
    const url = new URL(`${prefix}${normalizedPath}`, this.#config.baseUrl);
    for (const [key, value] of Object.entries(cleanParams(options?.params ?? {}))) {
      url.searchParams.set(key, value);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.#config.timeout);
    const headers = new Headers(this.#config.defaultHeaders);
    for (const [key, value] of new Headers(options?.headers).entries()) {
      headers.set(key, value);
    }
    headers.set('Authorization', `Bearer ${this.#config.apiKey}`);
    if (options?.contentType) {
      headers.set('Content-Type', options.contentType);
    } else if (!headers.has('Content-Type') && options?.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await this.#config.fetch(url.toString(), {
        method,
        body: options?.body,
        headers,
        signal: controller.signal,
      });

      if (response.status === 304) {
        return undefined as T;
      }

      if (!response.ok) {
        throw await this.toEelZapError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof EelZapError) {
        throw error;
      }

      throw new EelZapNetworkError(
        error,
        error instanceof Error ? error.message : 'Network request failed.',
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  #withJsonBody(
    body: unknown,
    options?: Omit<HttpRequestOptions, 'body'>,
  ): HttpRequestOptions | undefined {
    if (body === undefined) {
      return options;
    }

    return {
      ...options,
      body: JSON.stringify(body),
      contentType: 'application/json',
    };
  }

  private async toEelZapError(response: Response): Promise<EelZapError> {
    const contentType = response.headers.get('Content-Type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as Partial<ApiErrorPayload>;
      const code = payload.error?.code ?? 'INTERNAL_ERROR';
      const message =
        payload.error?.message ?? `Request failed with status ${String(response.status)}.`;
      const status = payload.error?.status ?? response.status;
      return new EelZapError(code, message, status);
    }

    return new EelZapError(
      'INTERNAL_ERROR',
      `Request failed with status ${String(response.status)}.`,
      response.status,
    );
  }
}
