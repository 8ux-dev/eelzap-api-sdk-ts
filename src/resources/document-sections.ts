import { HttpClient } from '../http';
import { buildResourcePath } from '../paths';
import type { SectionInfo, CreateSectionInput, UpdateSectionInput } from '../types/collections';
import type { DocumentSectionListResponse } from '../types/documents';

/**
 * Document section management endpoints.
 */
export class DocumentSectionsResource {
  readonly #http: HttpClient;

  /**
   * @internal
   */
  constructor(http: HttpClient) {
    this.#http = http;
  }

  /**
   * Lists all sections in a document.
   */
  async list(documentKey: string): Promise<SectionInfo[]> {
    const response = await this.#http.get<DocumentSectionListResponse>(
      buildResourcePath('documents', documentKey, 'sections'),
    );
    return response.sections;
  }

  /**
   * Gets a single section from a document.
   */
  async get(documentKey: string, sectionId: string): Promise<SectionInfo> {
    const response = await this.#http.get<{ section: SectionInfo }>(
      buildResourcePath('documents', documentKey, 'sections', sectionId),
    );
    return response.section;
  }

  /**
   * Creates a section in a document.
   */
  async create(documentKey: string, input: CreateSectionInput): Promise<SectionInfo> {
    const response = await this.#http.post<{ section: SectionInfo }>(
      buildResourcePath('documents', documentKey, 'sections'),
      input,
    );
    return response.section;
  }

  /**
   * Updates a section in a document.
   */
  async update(
    documentKey: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<SectionInfo> {
    const response = await this.#http.patch<{ section: SectionInfo }>(
      buildResourcePath('documents', documentKey, 'sections', sectionId),
      input,
    );
    return response.section;
  }

  /**
   * Deletes a section from a document.
   */
  async delete(documentKey: string, sectionId: string): Promise<{ success: true }> {
    return this.#http.delete<{ success: true }>(
      buildResourcePath('documents', documentKey, 'sections', sectionId),
    );
  }
}
