import assert from 'node:assert/strict';
import { COPY_LOCALES, DEFAULT_COPY_PAYLOADS } from '../lib/copy/defaults';
import { buildPublicCopyPayload } from '../lib/copy/public-payload';
import { normalizeCopyPayload } from '../lib/copy/resolve';
import { getPublishedCopyPayload } from '../lib/copy/published';

// Public responses must preserve the requested language and caller-supplied copy.
for (const locale of COPY_LOCALES) {
  const published = getPublishedCopyPayload(locale);
  const actual = buildPublicCopyPayload(locale, published, {}, '/', <T>(value: T) => value);
  assert.equal(actual.content[locale].nav.book, published.site.nav.book);
  assert.equal(actual.localizedCopy.ui.footer.faq, published.ui.footer.faq);
  assert.equal(actual.jpCopy.ui.footer.faq, published.ui.footer.faq);
  const payload = structuredClone(published);
  payload.site.nav.book = `${locale} booking label`;
  payload.ui.footer.faq = `${locale} FAQ label`;
  const data = buildPublicCopyPayload(locale, payload, {}, '/', <T>(value: T) => value);
  assert.equal(data.locale, locale);
  assert.equal(data.content[locale].nav.book, `${locale} booking label`);
  assert.equal(data.localizedCopy.ui.footer.faq, `${locale} FAQ label`);
  assert.equal(data.jpCopy.ui.footer.faq, `${locale} FAQ label`, 'Compatibility alias must use the active language');
}

for (const locale of COPY_LOCALES) {
  const payload = DEFAULT_COPY_PAYLOADS[locale];
  const legacyLocationPayload = structuredClone(payload);
  const legacyHirakata = legacyLocationPayload.locations.find((item) => item.id === 'osaka_hirakata')!;
  legacyHirakata.address = locale === 'en'
    ? 'Hirakata Mall 2F, 1-9-1, Hirakata-shi, Osaka 573-0032'
    : '〒573-0032 大阪府枚方市岡東町1-9-1 枚方モール 2F';
  legacyHirakata.access = locale === 'en' ? "Inside TULLY'S COFFEE" : 'タリーズコーヒー併設';
  const correctedLocationPayload = normalizeCopyPayload(locale, legacyLocationPayload);
  const correctedHirakata = correctedLocationPayload.locations.find((item) => item.id === 'osaka_hirakata')!;
  assert.equal(
    correctedHirakata.address,
    payload.locations.find((item) => item.id === 'osaka_hirakata')!.address,
    `${locale} published Hirakata address typo is corrected`,
  );
  assert.match(
    correctedHirakata.access,
    locale === 'en' ? /East Ticket Gate/ : /東改札口/,
    `${locale} published Hirakata directions include the station connection`,
  );
  assert.notEqual(
    legacyHirakata.address,
    correctedHirakata.address,
    `${locale} location migration does not mutate the stored payload`,
  );

  const customLocationPayload = structuredClone(payload);
  for (const location of customLocationPayload.locations) {
    location.address = `${locale} staff address for ${location.id}`;
    location.access = `${locale} staff directions for ${location.id}`;
  }
  customLocationPayload.locations.reverse();
  assert.deepEqual(
    normalizeCopyPayload(locale, customLocationPayload).locations,
    customLocationPayload.locations,
    `${locale} staff directions and addresses survive normalization in any order`,
  );

}

// Narrow display repairs must not change studio prices or overwrite newer copy.
const oldLayoutCopy = structuredClone(DEFAULT_COPY_PAYLOADS.jp);
oldLayoutCopy.site.privateParties.pricing.adult.price = '¥12,345';
oldLayoutCopy.site.teamBuilding.pricing.price = '¥23,456';
oldLayoutCopy.site.privateParties.occasions[3].title = ' ';
oldLayoutCopy.site.teamBuilding.valueProp.benefits[0].title = 'ウェルウェルビーイング';
const repairedLayoutCopy = normalizeCopyPayload('jp', oldLayoutCopy);
assert.equal(repairedLayoutCopy.site.privateParties.occasions[3].title, DEFAULT_COPY_PAYLOADS.jp.site.privateParties.occasions[3].title);
assert.equal(repairedLayoutCopy.site.teamBuilding.valueProp.benefits[0].title, 'ウェルビーイング');
assert.deepEqual(repairedLayoutCopy.site.privateParties.pricing, oldLayoutCopy.site.privateParties.pricing);
assert.deepEqual(repairedLayoutCopy.site.teamBuilding.pricing, oldLayoutCopy.site.teamBuilding.pricing);
oldLayoutCopy.site.privateParties.occasions[3].title = 'スタッフが編集したタイトル';
assert.equal(normalizeCopyPayload('jp', oldLayoutCopy).site.privateParties.occasions[3].title, 'スタッフが編集したタイトル');

console.log('Public copy language and pricing preservation checks passed.');
