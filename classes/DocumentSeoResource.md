[**@8ux-co/eelzap-api-sdk-ts**](../README.md)

***

[@8ux-co/eelzap-api-sdk-ts](../globals.md) / DocumentSeoResource

# Class: DocumentSeoResource

Defined in: [src/resources/document-seo.ts:9](https://github.com/8ux-co/eelzap-api-sdk-ts/blob/abd34740fd6daf4954dc9e9fc25def9edcf661e5/src/resources/document-seo.ts#L9)

Document SEO management endpoints.

## Methods

### get()

> **get**(`documentKey`, `options?`): `Promise`\<[`DocumentSeo`](../type-aliases/DocumentSeo.md)\>

Defined in: [src/resources/document-seo.ts:22](https://github.com/8ux-co/eelzap-api-sdk-ts/blob/abd34740fd6daf4954dc9e9fc25def9edcf661e5/src/resources/document-seo.ts#L22)

Gets SEO metadata for a document.

#### Parameters

##### documentKey

`string`

##### options?

###### locale?

`string`

#### Returns

`Promise`\<[`DocumentSeo`](../type-aliases/DocumentSeo.md)\>

***

### update()

> **update**(`documentKey`, `input`): `Promise`\<[`DocumentSeo`](../type-aliases/DocumentSeo.md)\>

Defined in: [src/resources/document-seo.ts:37](https://github.com/8ux-co/eelzap-api-sdk-ts/blob/abd34740fd6daf4954dc9e9fc25def9edcf661e5/src/resources/document-seo.ts#L37)

Updates SEO metadata for a document.

#### Parameters

##### documentKey

`string`

##### input

[`SeoInput`](../interfaces/SeoInput.md)

#### Returns

`Promise`\<[`DocumentSeo`](../type-aliases/DocumentSeo.md)\>
