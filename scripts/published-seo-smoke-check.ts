import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { DEFAULT_COPY_PAYLOADS } from '../lib/copy/defaults';
import { getPublishedCopyPayload } from '../lib/copy/published';
import { defaultContent } from '../data/content';
import { LOCATIONS } from '../constants';
import { isBlogPostAvailableForLanguage } from '../lib/blog-language';
import { locationSlugFromId } from '../lib/location-pages';
import type { LocalizedCopyPayload } from '../lib/copy/types';
import type { Metadata } from 'next';

type Route = {
  default: (props?: { params: Promise<{ slug: string }> }) => Promise<unknown>;
  generateMetadata: (props: { params: Promise<{ slug: string }> }) => Promise<Metadata>;
};
type JsonLd = Record<string, unknown>;

// Evaluate real route exports with request/store/view boundaries replaced. Pure
// copy resolution and JSON-LD helpers run unchanged; no database is contacted.
function loadRoute(file: string, lang: 'en' | 'jp', payload: LocalizedCopyPayload): Route {
  const filename = path.join(process.cwd(), file);
  const localRequire = createRequire(filename);
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const routeModule = { exports: {} };
  const fixtureRequire = (id: string): unknown => {
    if (id === 'server-only') return {};
    if (id === '@/lib/jsonld') {
      const helper = { exports: {} };
      const helperCode = ts.transpileModule(readFileSync(path.join(process.cwd(), 'lib/jsonld.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
      runInNewContext(helperCode, { require: fixtureRequire, module: helper, exports: helper.exports });
      return helper.exports;
    }
    if (/^@\/lib\/copy\/(published|store)$/.test(id)) return { getPublishedCopyPayload: async () => payload };
    if (/^@\/lib\/media\/(published|store)$/.test(id)) return { getPublishedMediaMap: async () => ({}) };
    if (id === '@/lib/request-lang') return {
      getRequestLang: async () => lang,
      buildOpenGraph: (input: unknown) => input,
      buildLocalizedAlternates: () => ({}),
    };
    if (id === 'next/navigation') return { notFound: () => { throw new Error('NOT_FOUND'); } };
    if (id.startsWith('@/components/') || id.startsWith('@/views/') || id === 'next/image') {
      return new Proxy({}, { get: () => () => null });
    }
    return localRequire(id.startsWith('@/') ? path.join(process.cwd(), id.slice(2)) : id);
  };
  runInNewContext(compiled, { require: fixtureRequire, module: routeModule, exports: routeModule.exports }, { filename });
  return routeModule.exports as Route;
}

function readTree(value: unknown, graphs: JsonLd[] = [], text: string[] = []): { graphs: JsonLd[]; text: string[] } {
  if (typeof value === 'string') text.push(value);
  if (Array.isArray(value)) value.forEach((child) => readTree(child, graphs, text));
  else if (value && typeof value === 'object' && 'props' in value) {
    const element = value as { type?: unknown; props: { children?: unknown; type?: string; dangerouslySetInnerHTML?: { __html: string } } };
    if (element.type === 'script' && element.props.type === 'application/ld+json') {
      graphs.push(JSON.parse(element.props.dangerouslySetInnerHTML!.__html));
    }
    readTree(element.props.children, graphs, text);
  }
  return { graphs, text };
}

async function main() {
  const sourcePost = defaultContent.blog.find((post) => post.published && isBlogPostAvailableForLanguage(post, 'en') && isBlogPostAvailableForLanguage(post, 'jp'))!;
  assert(sourcePost, 'Fixture requires a published bilingual article');
  const sourceLocation = LOCATIONS[0];
  for (const lang of ['en', 'jp'] as const) {
    const payload = structuredClone(DEFAULT_COPY_PAYLOADS[lang]);
    const post = payload.blog.find((item) => item.id === sourcePost.id)!;
    Object.assign(post, { title: `${lang} published article title`, excerpt: `${lang} published article excerpt`, author: `${lang} published author` });
    const location = payload.locations.find((item) => item.id === sourceLocation.id)!;
    Object.assign(location, { name: `${lang} published studio name`, address: `${lang} published street address`, access: `${lang} published transit instructions` });
    payload.locations.reverse();

    const blogDetail = loadRoute('app/blog/[slug]/page.tsx', lang, payload);
    const blogProps = { params: Promise.resolve({ slug: sourcePost.slug }) };
    const blogMetadata = await blogDetail.generateMetadata(blogProps);
    const article = readTree(await blogDetail.default(blogProps)).graphs.find((item) => item['@type'] === 'BlogPosting')!;
    const blogIndex = readTree(await loadRoute('app/blog/page.tsx', lang, payload).default()).graphs.find((item) => item['@type'] === 'Blog')!;
    const indexedArticle = (blogIndex.blogPost as JsonLd[]).find((item) => item['@id'] === article['@id'])!;
    assert(indexedArticle, `${lang}: fixture article must be in index graph`);
    assert.equal(article.headline, post.title);
    assert.equal(indexedArticle.headline, article.headline);
    assert.equal(blogMetadata.title, article.headline);
    assert.equal(blogMetadata.description, post.excerpt);
    assert.equal((blogMetadata.openGraph as { title: unknown }).title, article.headline);
    assert.equal((blogMetadata.twitter as { title: unknown }).title, article.headline);

    const locationDetail = loadRoute('app/locations/[slug]/page.tsx', lang, payload);
    const locationProps = { params: Promise.resolve({ slug: locationSlugFromId(sourceLocation.id) }) };
    const locationMetadata = await locationDetail.generateMetadata(locationProps);
    const detailTree = readTree(await locationDetail.default(locationProps));
    const detailGraph = detailTree.graphs.find((item) => item['@graph'])!['@graph'] as JsonLd[];
    const detailStudio = detailGraph.find((item) => item['@type'] === 'LocalBusiness')!;
    const indexGraph = readTree(await loadRoute('app/locations/page.tsx', lang, payload).default()).graphs.find((item) => item['@graph'])!['@graph'] as JsonLd[];
    const indexStudio = indexGraph.find((item) => item['@id'] === detailStudio['@id'])!;
    assert(indexStudio, `${lang}: studio ID must match between index and detail`);
    assert.equal(detailStudio.name, location.name);
    assert.equal(indexStudio.name, detailStudio.name);
    assert.deepEqual(indexStudio.address, detailStudio.address);
    assert.equal((detailStudio.address as JsonLd).streetAddress, location.address);
    assert(detailTree.text.includes(location.name), `${lang}: studio heading must use published name`);
    assert(detailTree.text.includes(location.address), `${lang}: studio address must use published copy`);
    assert(detailTree.text.includes(location.access), `${lang}: studio transit must use published copy`);
    assert((locationMetadata.title as { absolute: string }).absolute.includes(location.name));
    assert(locationMetadata.description?.includes(location.name));
  }
  // The live-source snapshot also passes through the same locale normalization.
  // Keep the approved Hirakata address after switching details to published copy.
  const publishedEnglish = await getPublishedCopyPayload('en');
  const hirakataProps = { params: Promise.resolve({ slug: 'osaka-hirakata' }) };
  const publishedDetail = readTree(await loadRoute('app/locations/[slug]/page.tsx', 'en', publishedEnglish).default(hirakataProps));
  const detailGraph = publishedDetail.graphs.find((item) => item['@graph'])!['@graph'] as JsonLd[];
  const detailStudio = detailGraph.find((item) => item['@type'] === 'LocalBusiness')!;
  const indexGraph = readTree(await loadRoute('app/locations/page.tsx', 'en', publishedEnglish).default()).graphs.find((item) => item['@graph'])!['@graph'] as JsonLd[];
  const indexStudio = indexGraph.find((item) => item['@id'] === detailStudio['@id'])!;
  const approvedAddress = 'Hirakata Mall 2F, 19-1 Okahigashicho, Hirakata, Osaka 573-0032';
  assert.equal((detailStudio.address as JsonLd).streetAddress, approvedAddress);
  assert.deepEqual(indexStudio.address, detailStudio.address);
  assert(publishedDetail.text.includes(approvedAddress), 'Published Hirakata visible English address must retain 19-1 Okahigashicho');
  console.log('Published SEO fixture passed: EN/JP article metadata and index/detail studio identities match staff overrides; published Hirakata address retains 19-1 Okahigashicho. No database reads or writes.');
}

void main();
