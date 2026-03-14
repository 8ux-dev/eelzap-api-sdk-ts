import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '../http';
import { DocumentSeoResource } from './document-seo';

describe('DocumentSeoResource', () => {
  it('gets and updates document seo', async () => {
    const get = vi.fn().mockResolvedValue({ seo: { metaTitle: 'Homepage' } });
    const put = vi.fn().mockResolvedValue({ seo: { metaTitle: 'Updated' } });
    const http = { get, put } as unknown as HttpClient;
    const resource = new DocumentSeoResource(http);

    await expect(resource.get('homepage', { locale: '*' })).resolves.toEqual({
      metaTitle: 'Homepage',
    });
    await expect(resource.update('homepage', { metaTitle: 'Updated' })).resolves.toEqual({
      metaTitle: 'Updated',
    });
  });
});
