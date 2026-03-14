import { HttpClient } from '../http';
import { buildResourcePath } from '../paths';
import type {
  CreateDocumentFieldInput,
  DocumentFieldListResponse,
  UpdateDocumentFieldInput,
} from '../types/documents';
import type { FieldInfo } from '../types/collections';
import { normalizeFieldInput } from './resource-helpers';

/**
 * Document field management endpoints.
 */
export class DocumentFieldsResource {
  readonly #http: HttpClient;

  /**
   * @internal
   */
  constructor(http: HttpClient) {
    this.#http = http;
  }

  /**
   * Lists all fields in a document.
   */
  async list(documentKey: string): Promise<FieldInfo[]> {
    const response = await this.#http.get<DocumentFieldListResponse>(
      buildResourcePath('documents', documentKey, 'fields'),
    );
    return response.fields;
  }

  /**
   * Gets a single field in a document.
   */
  async get(documentKey: string, fieldId: string): Promise<FieldInfo> {
    const response = await this.#http.get<{ field: FieldInfo }>(
      buildResourcePath('documents', documentKey, 'fields', fieldId),
    );
    return response.field;
  }

  /**
   * Creates a field in a document.
   */
  async create(documentKey: string, input: CreateDocumentFieldInput): Promise<FieldInfo> {
    const response = await this.#http.post<{ field: FieldInfo }>(
      buildResourcePath('documents', documentKey, 'fields'),
      normalizeFieldInput(input),
    );
    return response.field;
  }

  /**
   * Updates a field in a document.
   */
  async update(
    documentKey: string,
    fieldId: string,
    input: UpdateDocumentFieldInput,
  ): Promise<FieldInfo> {
    const response = await this.#http.patch<{ field: FieldInfo }>(
      buildResourcePath('documents', documentKey, 'fields', fieldId),
      normalizeFieldInput(input),
    );
    return response.field;
  }

  /**
   * Deletes a field from a document.
   */
  async delete(documentKey: string, fieldId: string): Promise<{ success: true }> {
    return this.#http.delete<{ success: true }>(
      buildResourcePath('documents', documentKey, 'fields', fieldId),
    );
  }

  /**
   * Reorders document fields.
   */
  async reorder(documentKey: string, fieldIds: string[]): Promise<{ success: true }> {
    return this.#http.post<{ success: true }>(
      buildResourcePath('documents', documentKey, 'fields', 'reorder'),
      { fieldIds },
    );
  }
}
