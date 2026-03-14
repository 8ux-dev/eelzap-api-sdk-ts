import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '../http';
import { ItemSeoResource } from './item-seo';

describe('ItemSeoResource', () => {
  it('gets and updates item seo', async () => {
    const get = vi.fn().mockResolvedValue({ seo: { metaTitle: 'Hello' } });
    const patch = vi.fn().mockResolvedValue({ seo: { metaTitle: 'Updated' } });
    const http = { get, patch } as unknown as HttpClient;
    const resource = new ItemSeoResource(http);

    await expect(resource.get('blog', 'hello-world', { locale: 'en' })).resolves.toEqual({
      metaTitle: 'Hello',
    });
    await expect(resource.update('blog', 'hello-world', { metaTitle: 'Updated' })).resolves.toEqual(
      { metaTitle: 'Updated' },
    );

    expect(get).toHaveBeenCalledWith('/collections/blog/items/hello-world/seo', {
      params: { locale: 'en' },
    });
    expect(patch).toHaveBeenCalledWith('/collections/blog/items/hello-world/seo', {
      metaTitle: 'Updated',
    });
  });
});
