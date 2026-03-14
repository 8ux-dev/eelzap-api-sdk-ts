# @8ux-co/eelzap-api-sdk-ts

[![npm version](https://img.shields.io/npm/v/%408ux-co%2Feelzap-api-sdk-ts)](https://www.npmjs.com/package/@8ux-co/eelzap-api-sdk-ts)
[![CI](https://img.shields.io/github/actions/workflow/status/8ux-co/eelzap-api-sdk-ts/ci.yml?branch=main&label=ci)](https://github.com/8ux-co/eelzap-api-sdk-ts/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%408ux-co%2Feelzap-api-sdk-ts)](https://github.com/8ux-co/eelzap-api-sdk-ts/blob/main/LICENSE)
[![Docs](https://img.shields.io/badge/docs-github%20pages-blue)](https://8ux-co.github.io/eelzap-api-sdk-ts/)

Official TypeScript client for the EelZap Content Delivery API.

## Installation

```bash
npm install @8ux-co/eelzap-api-sdk-ts
```

## Quick Start

```ts
import { createClient } from '@8ux-co/eelzap-api-sdk-ts';

const cms = createClient({
  apiKey: process.env.EELZAP_API_KEY!,
});

const { data: posts } = await cms.items.list('blog-posts', {
  pageSize: 10,
  sort: '-publishedAt',
  locale: 'en',
});
```

## Configuration

`createClient` accepts:

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `apiKey` | `string` | Yes | — |
| `baseUrl` | `string` | No | `https://api.eelzap.com` |
| `pathPrefix` | `string` | No | `/v1` |
| `locale` | `string` | No | Site default locale |
| `status` | `'published' \| 'draft' \| 'all'` | No | `published` |
| `fetch` | `typeof fetch` | No | Global `fetch` |
| `defaultHeaders` | `HeadersInit` | No | — |
| `timeout` | `number` | No | `30000` |

## Usage

### Collections

```ts
const collections = await cms.collections.list();
const blog = await cms.collections.get('blog-posts');
const created = await cms.collections.create({
  name: 'Blog Posts',
  key: 'blog-posts',
});
await cms.collections.fields.create('blog-posts', {
  key: 'title',
  name: 'Title',
  type: 'SHORT_TEXT',
});
```

### Items

```ts
const products = await cms.items.list('products', {
  page: 1,
  pageSize: 20,
  sort: '-price',
  fields: ['title', 'price', 'category'],
  filter: {
    category: 'electronics',
    price: { gte: 100, lt: 500 },
  },
});

const product = await cms.items.get('products', 'noise-cancelling-headphones', {
  locale: 'en',
});

await cms.items.create('products', {
  slug: 'noise-cancelling-headphones',
  values: {
    title: 'Noise Cancelling Headphones',
  },
});
await cms.items.publish('products', 'noise-cancelling-headphones');
```

### Query Builder

```ts
const result = await cms.items
  .collection('products')
  .locale('en')
  .filter('category', 'electronics')
  .filter('price', { gte: 100 })
  .sort('-price')
  .fields(['title', 'price'])
  .page(1)
  .pageSize(20)
  .get();
```

### Documents

```ts
const documents = await cms.documents.list({ locale: 'en' });
const homepage = await cms.documents.get('homepage', {
  locale: 'en',
  status: 'draft',
});

await cms.documents.values.update('homepage', {
  hero_title: 'Welcome',
});
await cms.documents.seo.update('homepage', {
  metaTitle: 'Homepage',
});
```

### Site

```ts
const site = await cms.site.get();
```

### Media

```ts
const media = await cms.media.upload({
  file: new Blob(['hello'], { type: 'text/plain' }),
  filename: 'hello.txt',
  contentType: 'text/plain',
  title: 'Greeting',
});

await cms.media.publish(media.id);
```

### Rich Text And Media Helpers

```ts
import {
  getMediaUrl,
  richTextToHtml,
  richTextToPlainText,
  type RichTextDocument,
} from '@8ux-co/eelzap-api-sdk-ts';

const description = item.content.description as RichTextDocument | null;

const html = richTextToHtml(description);
const excerpt = richTextToPlainText(description);
const imageUrl = getMediaUrl(item.content.heroImage);
```

## Next.js

```ts
// lib/cms.ts
import { createClient } from '@8ux-co/eelzap-api-sdk-ts';

export const cms = createClient({
  apiKey: process.env.EELZAP_API_KEY!,
  baseUrl: process.env.EELZAP_BASE_URL,
  pathPrefix: process.env.EELZAP_PATH_PREFIX,
});
```

```ts
// app/blog/page.tsx
import { cms } from '@/lib/cms';

export const revalidate = 60;

export default async function BlogPage() {
  const { data } = await cms.items.list('blog-posts', { pageSize: 10 });
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## Error Handling

```ts
import { isEelZapError } from '@8ux-co/eelzap-api-sdk-ts';

try {
  await cms.items.get('blog-posts', 'missing-post');
} catch (error) {
  if (isEelZapError(error)) {
    console.error(error.code, error.status, error.message);
  }
}
```

## TypeScript

Use generics when you know a content shape:

```ts
type BlogPost = {
  title: string;
  excerpt: string;
};

const post = await cms.items.get<BlogPost>('blog-posts', 'hello-world');
post.content.title;
```

## Security

- Keep secret keys on the server only.
- Use public keys for browser clients.
- Do not commit `.env`; this repo includes `.env.example` only.
- `EelZapClient#toString()` masks the API key for safer logging.

## API Reference

Generate docs locally with:

```bash
npm run docs
```

Live API docs:

<https://8ux-co.github.io/eelzap-api-sdk-ts/>

The published documentation is deployed from the `gh-pages` branch by CI.
That branch is generated output only:

- do not develop on `gh-pages`
- do not open pull requests from `gh-pages` into `main`
- expect `gh-pages` to diverge from `main`, because it contains built docs rather than source code

## Contributing

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
