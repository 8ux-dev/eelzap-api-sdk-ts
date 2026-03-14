import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '../http';
import { SiteResource } from './site';

describe('SiteResource', () => {
  it('gets the current site', async () => {
    const get = vi.fn().mockResolvedValue({ id: 'site_1' });
    const http = { get } as unknown as HttpClient;
    const resource = new SiteResource(http);

    await expect(resource.get()).resolves.toEqual({ id: 'site_1' });
    expect(get).toHaveBeenCalledWith('/site');
  });
});
