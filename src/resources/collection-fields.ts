import { HttpClient } from '../http';
import { buildResourcePath } from '../paths';
import type {
  CollectionFieldListResponse,
  CreateFieldInput,
  FieldInfo,
  UpdateFieldInput,
} from '../types/collections';
import { normalizeFieldInput } from './resource-helpers';

/**
 * Collection field management endpoints.
 */
export class CollectionFieldsResource {
  readonly #http: HttpClient;

  /**
   * @internal
   */
  constructor(http: HttpClient) {
    this.#http = http;
  }

  /**
   * Lists all fields in a collection.
   */
  async list(collectionKey: string): Promise<FieldInfo[]> {
    const response = await this.#http.get<CollectionFieldListResponse>(
      buildResourcePath('collections', collectionKey, 'fields'),
    );
    return response.fields;
  }

  /**
   * Creates a field in a collection.
   */
  async create(collectionKey: string, input: CreateFieldInput): Promise<FieldInfo> {
    const response = await this.#http.post<{ field: FieldInfo }>(
      buildResourcePath('collections', collectionKey, 'fields'),
      normalizeFieldInput(input),
    );
    return response.field;
  }

  /**
   * Updates a field in a collection.
   */
  async update(
    collectionKey: string,
    fieldId: string,
    input: UpdateFieldInput,
  ): Promise<FieldInfo> {
    const response = await this.#http.patch<{ field: FieldInfo }>(
      buildResourcePath('collections', collectionKey, 'fields', fieldId),
      normalizeFieldInput(input),
    );
    return response.field;
  }

  /**
   * Deletes a field from a collection.
   */
  async delete(collectionKey: string, fieldId: string): Promise<{ success: true }> {
    return this.#http.delete<{ success: true }>(
      buildResourcePath('collections', collectionKey, 'fields', fieldId),
    );
  }

  /**
   * Reorders collection fields.
   */
  async reorder(collectionKey: string, fieldIds: string[]): Promise<{ success: true }> {
    return this.#http.put<{ success: true }>(
      buildResourcePath('collections', collectionKey, 'fields', 'reorder'),
      { fieldIds },
    );
  }
}
