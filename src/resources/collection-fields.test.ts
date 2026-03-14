import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '../http';
import { CollectionFieldsResource } from './collection-fields';

describe('CollectionFieldsResource', () => {
  it('lists, creates, updates, deletes, and reorders collection fields', async () => {
    const get = vi.fn().mockResolvedValue({ fields: [{ id: 'field_1' }] });
    const post = vi.fn().mockResolvedValue({ field: { id: 'field_1', label: 'Title' } });
    const patch = vi.fn().mockResolvedValue({ field: { id: 'field_1', label: 'Post Title' } });
    const del = vi.fn().mockResolvedValue({ success: true });
    const put = vi.fn().mockResolvedValue({ success: true });
    const http = { get, post, patch, delete: del, put } as unknown as HttpClient;
    const resource = new CollectionFieldsResource(http);

    await expect(resource.list('blog')).resolves.toEqual([{ id: 'field_1' }]);
    await expect(
      resource.create('blog', { key: 'title', name: 'Title', type: 'SHORT_TEXT' }),
    ).resolves.toEqual({ id: 'field_1', label: 'Title' });
    await expect(resource.update('blog', 'field_1', { name: 'Post Title' })).resolves.toEqual({
      id: 'field_1',
      label: 'Post Title',
    });
    await expect(resource.delete('blog', 'field_1')).resolves.toEqual({ success: true });
    await expect(resource.reorder('blog', ['field_1'])).resolves.toEqual({ success: true });

    expect(post).toHaveBeenCalledWith('/collections/blog/fields', {
      key: 'title',
      name: 'Title',
      type: 'SHORT_TEXT',
      label: 'Title',
    });
    expect(patch).toHaveBeenCalledWith('/collections/blog/fields/field_1', {
      name: 'Post Title',
      label: 'Post Title',
    });
    expect(put).toHaveBeenCalledWith('/collections/blog/fields/reorder', { fieldIds: ['field_1'] });
  });
});
