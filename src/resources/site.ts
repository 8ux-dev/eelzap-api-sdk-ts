import { HttpClient } from '../http';
import { buildResourcePath } from '../paths';
import type { SiteInfo } from '../types/common';

/**
 * Site introspection endpoints.
 */
export class SiteResource {
  readonly #http: HttpClient;

  /**
   * @internal
   */
  constructor(http: HttpClient) {
    this.#http = http;
  }

  /**
   * Resolves the current site from the authenticated API key.
   */
  async get(): Promise<SiteInfo> {
    return this.#http.get<SiteInfo>(buildResourcePath('site'));
  }
}
