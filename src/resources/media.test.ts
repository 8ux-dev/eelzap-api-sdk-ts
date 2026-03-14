import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '../http';
import { MediaResource } from './media';

describe('MediaResource', () => {
  it('lists, gets, updates, deletes, publishes, and unpublishes media', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({ items: [], page: 1, pageSize: 20 })
      .mockResolvedValueOnce({ id: 'media_1' })
      .mockResolvedValue({ items: [{ id: 'media_2' }], page: 1, pageSize: 20 });
    const patch = vi.fn().mockResolvedValue({ media: { id: 'media_1', alt: 'Hero' } });
    const del = vi.fn().mockResolvedValue({ success: true });
    const post = vi
      .fn()
      .mockResolvedValueOnce({ media: { id: 'media_1', status: 'PUBLISHED' } })
      .mockResolvedValueOnce({ media: { id: 'media_1', status: 'DRAFT' } });
    const http = { get, patch, delete: del, post } as unknown as HttpClient;
    const resource = new MediaResource(http);

    await expect(resource.list({ search: 'hero', page: 1 })).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 20,
    });
    await expect(resource.get('media_1')).resolves.toEqual({ id: 'media_1' });
    await expect(resource.update('media_1', { alt: 'Hero' })).resolves.toEqual({
      id: 'media_1',
      alt: 'Hero',
    });
    await expect(resource.delete('media_1')).resolves.toEqual({ success: true });
    await expect(resource.publish('media_1')).resolves.toEqual({
      id: 'media_1',
      status: 'PUBLISHED',
    });
    await expect(resource.unpublish('media_1')).resolves.toEqual({
      id: 'media_1',
      status: 'DRAFT',
    });

    expect(get).toHaveBeenCalledWith('/media', {
      params: {
        search: 'hero',
        page: 1,
        pageSize: undefined,
        sort: undefined,
        type: undefined,
        status: undefined,
        usage: undefined,
      },
    });
    await expect(resource.list()).resolves.toEqual({
      items: [{ id: 'media_2' }],
      page: 1,
      pageSize: 20,
    });
  });

  it('creates upload urls, confirms uploads, and performs high-level uploads', async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com',
        mediaId: 'media_1',
        key: 'site/media_1',
      })
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com',
        mediaId: 'media_1',
        key: 'site/media_1',
      })
      .mockResolvedValueOnce({
        media: { id: 'media_1', alt: null, title: null, description: null },
      });
    const upload = vi.fn().mockResolvedValue(undefined);
    const patch = vi.fn().mockResolvedValue({
      media: { id: 'media_1', alt: 'Hero', title: 'Homepage Hero', description: null },
    });
    const http = { post, upload, patch } as unknown as HttpClient;
    const resource = new MediaResource(http);

    await expect(
      resource.createUploadUrl({
        filename: 'hero.png',
        contentType: 'image/png',
        size: 123,
      }),
    ).resolves.toEqual({
      uploadUrl: 'https://upload.example.com',
      mediaId: 'media_1',
      key: 'site/media_1',
    });
    await expect(
      resource.upload({
        file: new Uint8Array([1, 2, 3]),
        filename: 'hero.png',
        contentType: 'image/png',
        alt: 'Hero',
        title: 'Homepage Hero',
      }),
    ).resolves.toEqual({
      id: 'media_1',
      alt: 'Hero',
      title: 'Homepage Hero',
      description: null,
    });

    const [uploadUrl, uploadBody, uploadHeaders] = upload.mock.calls[0] as [
      string,
      Blob,
      HeadersInit,
    ];
    expect(uploadUrl).toBe('https://upload.example.com');
    expect(uploadBody).toBeInstanceOf(Blob);
    expect(uploadHeaders).toEqual({ 'Content-Type': 'image/png' });
    expect(patch).toHaveBeenCalledWith('/media/media_1', {
      alt: 'Hero',
      title: 'Homepage Hero',
      description: null,
    });
  });

  it('supports blob and arraybuffer uploads without metadata updates', async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com/blob',
        mediaId: 'media_blob',
        key: 'site/media_blob',
      })
      .mockResolvedValueOnce({
        media: { id: 'media_blob', alt: null, title: null, description: null },
      })
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com/array-buffer',
        mediaId: 'media_buffer',
        key: 'site/media_buffer',
      })
      .mockResolvedValueOnce({
        media: { id: 'media_buffer', alt: null, title: null, description: null },
      })
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com/shared-array-buffer',
        mediaId: 'media_shared',
        key: 'site/media_shared',
      })
      .mockResolvedValueOnce({
        media: { id: 'media_shared', alt: null, title: null, description: null },
      })
      .mockResolvedValueOnce({
        uploadUrl: 'https://upload.example.com/fallback',
        mediaId: 'media_fallback',
        key: 'site/media_fallback',
      })
      .mockResolvedValueOnce({
        media: {
          id: 'media_fallback',
          alt: null,
          title: null,
          description: 'Generated description',
        },
      });
    const upload = vi.fn().mockResolvedValue(undefined);
    const patch = vi.fn().mockResolvedValue({
      media: {
        id: 'media_fallback',
        alt: null,
        title: null,
        description: 'Generated description',
      },
    });
    const http = { post, upload, patch } as unknown as HttpClient;
    const resource = new MediaResource(http);

    await expect(
      resource.upload({
        file: new Blob(['hello'], { type: 'text/plain' }),
        filename: 'hello.txt',
        contentType: 'text/plain',
      }),
    ).resolves.toEqual({
      id: 'media_blob',
      alt: null,
      title: null,
      description: null,
    });

    await expect(
      resource.upload({
        file: new ArrayBuffer(8),
        filename: 'buffer.bin',
        contentType: 'application/octet-stream',
      }),
    ).resolves.toEqual({
      id: 'media_buffer',
      alt: null,
      title: null,
      description: null,
    });

    await expect(
      resource.upload({
        file: new Uint8Array(new SharedArrayBuffer(4)),
        filename: 'shared.bin',
        contentType: 'application/octet-stream',
      }),
    ).resolves.toEqual({
      id: 'media_shared',
      alt: null,
      title: null,
      description: null,
    });

    await expect(
      resource.upload({
        file: {} as unknown as ArrayBuffer,
        filename: 'fallback.bin',
        contentType: 'application/octet-stream',
        description: 'Generated description',
      }),
    ).resolves.toEqual({
      id: 'media_fallback',
      alt: null,
      title: null,
      description: 'Generated description',
    });

    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith('/media/media_fallback', {
      alt: null,
      title: null,
      description: 'Generated description',
    });
  });
});
