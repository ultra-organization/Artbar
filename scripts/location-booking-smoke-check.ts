import assert from 'node:assert/strict';
import { LOCATIONS, getArtbarLocationScheduleEmbedUrl } from '../constants';
import { getLocationBookingDestination, getLocationStudioScheduleUrl } from '../lib/location-booking';
import { getTrustedPaintaEmbedOrigin } from '../lib/painta-embed-origin';

for (const location of LOCATIONS) {
  for (const lang of ['en', 'jp'] as const) {
    const locale = lang === 'jp' ? 'ja' : 'en';
    const isOsaka = location.id.startsWith('osaka_');
    const origin = isOsaka ? 'https://tickets.artbar.co.jp' : 'https://booking.artbar.co.jp';
    const embed = new URL(getArtbarLocationScheduleEmbedUrl(location.id, locale)!);
    const fullSchedule = new URL(getLocationStudioScheduleUrl(location.id, lang));
    const fullLocationId = fullSchedule.searchParams.get('locationId');
    assert.equal(embed.origin, origin, `${location.id}: embed must use the regional booking host`);
    assert.equal(fullSchedule.origin, origin, `${location.id}: full schedule must use the regional booking host`);
    assert.equal(embed.pathname, `/embed/${isOsaka ? 'artbar-osaka' : 'artbar-tokyo'}/upcoming`);
    assert.equal(embed.searchParams.get('locale'), locale);
    assert.equal(embed.searchParams.get('fallback'), 'strict');
    assert.equal(fullSchedule.pathname, `/${locale}${isOsaka ? '/artbar-osaka' : ''}`);
    if (location.id === 'yokohama') {
      // Both active Painta records share this studio address (master + Atelier).
      const expected = '76752feb-31ed-4505-a068-8363bbeb576c,a08ed9ba-04d3-4e21-8ce5-e625c544df5c';
      assert.equal(fullLocationId, expected, 'Yokohama must retain both active location records');
      assert(fullSchedule.search.includes('%2C'), 'The multiple-location query must be URL encoded');
    } else {
      assert.match(fullLocationId ?? '', /^[0-9a-f-]{36}$/, `${location.id}: full schedule must name one exact studio UUID`);
    }
    assert.equal(embed.searchParams.get('location'), fullLocationId, `${location.id}: embed and full schedule must use exactly the same studio records`);
    assert.equal(getLocationBookingDestination(location.id, lang).href, `${lang === 'en' ? '/en' : ''}/locations/${location.id.replace(/_/g, '-')}#studio-classes`);
  }
}

assert.equal(getArtbarLocationScheduleEmbedUrl('unknown', 'en'), null);
assert.throws(() => getLocationStudioScheduleUrl('unknown', 'en'), /Unknown Artbar studio/);
for (const origin of ['https://booking.artbar.co.jp', 'https://tickets.artbar.co.jp']) {
  assert.equal(getTrustedPaintaEmbedOrigin(`${origin}/embed/artbar-tokyo/upcoming`), origin);
}
for (const src of ['https://evil.example/embed', 'https://tickets.artbar.co.jp.evil.example', 'https://booking.artbar.co.jp@evil.example', 'javascript:alert(1)', '/relative', 'invalid']) {
  assert.equal(getTrustedPaintaEmbedOrigin(src), null, `Unexpected trusted iframe origin: ${src}`);
}
console.log('Location booking smoke check passed: 7 studios in both languages, strict studio links and trusted iframe origins.');
