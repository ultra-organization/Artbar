import {
  LOCATION_SHORT_LABELS,
  POPULAR_THEMES_JP,
  PRIVATE_PARTY_CAPACITY_ROWS,
  TEAM_BUILDING_LOGISTICS_ROWS,
} from '@/constants';
import { defaultContent } from '@/data/content';
import {
  DEFAULT_COPY_PAYLOADS,
  deepMergeTemplate,
} from '@/lib/copy/defaults';
import { sanitizeBlogHtml } from '@/lib/blog-html';
import type {
  CopyLocale,
  JapaneseCopyPayload,
  LocalizedCopyPayload,
  ResolvedJapaneseCopy,
} from '@/lib/copy/types';
import type { ContentData } from '@/types';

type JapaneseThemeItem = JapaneseCopyPayload['site']['home']['themes']['items'][number];

const LEGACY_THEME_SLUGS: Record<string, string> = {
  'texture-painting': 'texture-art',
};

// Replace only known old defaults, so published locale payloads pick up corrected
// directions without overwriting staff-written address or access instructions.
const LEGACY_LOCATION_COPY: Record<
  CopyLocale,
  Record<string, Partial<Record<'address' | 'access', string[]>>>
> = {
  en: {
    daikanyama: { access: ['5-minute walk from Daikanyama Station | 8-minute walk from Ebisu Station'] },
    harajuku: {
      address: ['5-30-2 Jingumae, Shibuya-ku, Tokyo – 201 Takara Building 150-0001. 201 Takara Building.'],
      access: ['7-minute walk from Shibuya Station'],
    },
    ginza: { access: ['Access:\nMetro Ginza-Itchome Station 1 min walk\nJR Yurakucho Station 4 min walk\nMetro Ginza Station 5 min walk'] },
    yokohama: { access: ['Motomachi-Chukagai station – 3 min walk\nIshikawacho station – 10 min walk'] },
    osaka_namba: { access: ['Please change to the low-floor elevator on the 10th floor common area and go up to the 17th floor. The studio is at the end of the corridor on your left.'] },
    osaka_umeda: {
      address: ['Grand Green Osaka Shops & Restaurants North Bldg 2F, 6-38 Ofukacho, Kita-ku, Osaka-shi'],
      access: ["Inside Tully's Coffee / Yurindo"],
    },
    osaka_hirakata: {
      address: ['Hirakata Mall 2F, 1-9-1, Hirakata-shi, Osaka 573-0032'],
      access: ["Inside TULLY'S COFFEE"],
    },
  },
  jp: {
    daikanyama: { access: ['代官山駅 徒歩5分 | 恵比寿駅 徒歩8分'] },
    harajuku: { access: ['渋谷駅 徒歩7分 | 明治神宮前駅 徒歩5分'] },
    ginza: { access: [
      'アクセス:\n東京メトロ 銀座一丁目駅 徒歩1分\nJR 有楽町駅 徒歩4分\n東京メトロ 銀座駅 徒歩5分',
      '銀座一丁目駅 徒歩1分\n有楽町駅 徒歩5分\n銀座駅 徒歩5分',
    ] },
    yokohama: { access: ['みなとみらい線 元町・中華街駅 徒歩3分\nJR石川町駅 徒歩10分'] },
    osaka_namba: { access: ['10階で低層階用エレベーターに乗り換え、17階へお上がりください。スタジオは廊下突き当たり左手です。'] },
    osaka_umeda: {
      address: ['大阪府大阪市北区大深町6-38 グラングリーン大阪 ショップ＆レストラン 北館 2F'],
      access: ['タリーズコーヒー / 有隣堂 併設'],
    },
    osaka_hirakata: {
      address: [
        '〒573-0032 大阪府枚方市1-9-1 枚方モール 2F',
        '〒573-0032 大阪府枚方市岡東町1-9-1 枚方モール 2F',
      ],
      access: ['タリーズコーヒー併設', "TULLY'S COFFEE内"],
    },
  },
};

function migrateLegacyLocationCopy(locale: CopyLocale, payload: LocalizedCopyPayload): void {
  for (const location of payload.locations) {
    const legacy = LEGACY_LOCATION_COPY[locale][location.id];
    const current = DEFAULT_COPY_PAYLOADS[locale].locations.find((item) => item.id === location.id);
    if (!legacy || !current) continue;
    for (const field of ['address', 'access'] as const) {
      if (legacy[field]?.includes(location[field])) {
        location[field] = current[field];
      }
    }
  }
}

const LEGACY_CANCEL_FAQ_EN =
  'You can self-cancel your reservation from the bottom of your email confirmation.\n\nCancellation policies may differ for some classes that require custom orders. Please check your individual class information for specifics.\n\nFor most classes, our cancellation policy is:\nFull refund: Cancel up to 3 days before the event start time.\n25% cancellation fee: Cancel between 3 days and 24 hours before the event start time.\nNo refund: Cancellations within 24 hours of the event start time.\n\nGift certificates are non-refundable.';

const LEGACY_CANCEL_FAQ_JP =
  '予約確認メールの下部から、ご自身でキャンセル手続きができます。\n\n特注品や準備が必要なクラスは、キャンセルポリシーが異なる場合があります。詳細は各クラスの案内をご確認ください。\n\n多くのクラスのキャンセルポリシーは以下の通りです。\n全額返金: イベント開始3日前までのキャンセル。\n25%キャンセル料: イベント開始3日前から24時間前までのキャンセル。\n返金不可: イベント開始24時間以内のキャンセル。\n\nギフト券は返金不可です。';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRawJapaneseThemeItems(payload: unknown): JapaneseThemeItem[] | null {
  if (!isRecord(payload)) return null;
  const site = (payload as { site?: unknown }).site;
  if (!isRecord(site)) return null;
  const home = (site as { home?: unknown }).home;
  if (!isRecord(home)) return null;
  const themes = (home as { themes?: unknown }).themes;
  if (!isRecord(themes)) return null;
  const items = (themes as { items?: unknown }).items;
  return Array.isArray(items) ? (items as JapaneseThemeItem[]) : null;
}

function migrateLegacyField(
  item: Record<string, unknown>,
  legacyKey: string,
  neutralKey: string,
): void {
  if (typeof item[neutralKey] === 'string') return;
  if (typeof item[legacyKey] === 'string') {
    item[neutralKey] = item[legacyKey];
  }
}

function migrateLegacyJapaneseArrayFields(
  payload: Record<string, unknown>,
  arrayKey: string,
  fields: Array<[legacyKey: string, neutralKey: string]>,
): void {
  const items = payload[arrayKey];
  if (!Array.isArray(items)) return;

  for (const item of items) {
    if (!isRecord(item)) continue;
    for (const [legacyKey, neutralKey] of fields) {
      migrateLegacyField(item, legacyKey, neutralKey);
    }
  }
}

function migrateLegacyJapaneseFieldNames(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;

  const migrated = structuredClone(payload) as Record<string, unknown>;

  migrateLegacyJapaneseArrayFields(migrated, 'instructors', [
    ['roleJp', 'role'],
    ['descJp', 'desc'],
  ]);
  migrateLegacyJapaneseArrayFields(migrated, 'locations', [
    ['nameJp', 'name'],
    ['addressJp', 'address'],
    ['accessJp', 'access'],
  ]);
  migrateLegacyJapaneseArrayFields(migrated, 'blog', [
    ['titleJp', 'title'],
    ['excerptJp', 'excerpt'],
    ['contentJp', 'content'],
    ['authorJp', 'author'],
  ]);

  return migrated;
}

function normalizeJapaneseThemeItems(
  items: JapaneseCopyPayload['site']['home']['themes']['items'],
  rawItems: JapaneseThemeItem[] | null,
): JapaneseCopyPayload['site']['home']['themes']['items'] {
  const rawItemsBySlug = new Map(
    (rawItems ?? [])
      .filter((item) => typeof item.slug === 'string')
      .map((item) => [item.slug as string, item]),
  );
  const itemsBySlug = new Map(
    items
      .filter((item) => typeof item.slug === 'string')
      .map((item) => [item.slug as string, item]),
  );

  return POPULAR_THEMES_JP.map((theme, index) => {
    const legacySlug = LEGACY_THEME_SLUGS[theme.slug];
    const candidate =
      rawItemsBySlug.get(theme.slug) ??
      (legacySlug ? rawItemsBySlug.get(legacySlug) : undefined) ??
      itemsBySlug.get(theme.slug) ??
      (legacySlug ? itemsBySlug.get(legacySlug) : undefined) ??
      (items.length === POPULAR_THEMES_JP.length ? items[index] : undefined);

    return {
      ...theme,
      ...(candidate ?? {}),
      image: theme.image,
      slug: theme.slug,
    };
  });
}

export function normalizeJapaneseCopyPayload(payload: unknown): JapaneseCopyPayload {
  const migratedPayload = migrateLegacyJapaneseFieldNames(payload);
  const rawThemeItems = getRawJapaneseThemeItems(migratedPayload);
  const normalized = deepMergeTemplate(DEFAULT_COPY_PAYLOADS.jp, migratedPayload);
  migrateLegacyLocationCopy('jp', normalized);

  // Theme card slugs are hidden routing IDs. Keep Momo's visible copy, but prevent
  // edited or older payloads from sending customers to the wrong theme page.
  normalized.site.home.themes.items = normalizeJapaneseThemeItems(
    normalized.site.home.themes.items,
    rawThemeItems,
  );

  const celebration = normalized.site.privateParties.occasions[3];
  if (celebration && !celebration.title.replace(/\u200b/g, '').trim()) {
    celebration.title = DEFAULT_COPY_PAYLOADS.jp.site.privateParties.occasions[3].title;
  }
  normalized.site.teamBuilding.valueProp.benefits = normalized.site.teamBuilding.valueProp.benefits.map((item) => ({
    ...item, title: item.title.replace('ウェルウェルビーイング', 'ウェルビーイング'),
  }));
  normalized.faqs = normalized.faqs.map((faq) => ({
    ...faq, question: faq.question.replace('子どみ', '子ども').replace('獲得で来ますか', '獲得できますか'),
  }));

  // Retire the older high-commitment CTA copy still stored in published
  // locale payloads. Editors can still publish any newer wording they choose.
  if (normalized.site.nav.book === '予約する') {
    normalized.site.nav.book = '空き日程を見る';
  }
  if (normalized.site.home.hero.ctaSchedule === 'セッションを予約する') {
    normalized.site.home.hero.ctaSchedule = '空き日程と料金を見る';
  }
  if (normalized.ui.home.bookTeamBuildingCta === 'チームビルディングを予約') {
    normalized.ui.home.bookTeamBuildingCta = '法人向けプランを見る';
  }
  if (normalized.ui.themeDetail.upcomingClassesTitle === '{{name}}の今後1週間のクラス') {
    normalized.ui.themeDetail.upcomingClassesTitle = '今後の{{name}}クラス';
  }
  if (
    normalized.ui.themeDetail.upcomingClassesSub ===
    '現在予約できるクラスをご覧ください。横にスワイプすると、ほかの日程も確認できます。'
  ) {
    normalized.ui.themeDetail.upcomingClassesSub =
      '次回開催予定のクラスをご覧ください。横にスワイプすると、ほかの日程も確認できます。';
  }
  const currentCancelFaqJp = DEFAULT_COPY_PAYLOADS.jp.faqs.find(
    (faq) => faq.question === 'セッションをキャンセルするにはどうすればよいですか？',
  );
  normalized.faqs = normalized.faqs.map((faq) =>
    faq.question === 'セッションをキャンセルするにはどうすればよいですか？' &&
    faq.answer === LEGACY_CANCEL_FAQ_JP
      ? { ...faq, answer: currentCancelFaqJp?.answer ?? faq.answer }
      : faq,
  );

  normalized.blog = normalized.blog.map((item) => ({
    ...item,
    content: sanitizeBlogHtml(item.content),
  }));

  return normalized;
}

export function normalizeCopyPayload(locale: CopyLocale, payload: unknown): LocalizedCopyPayload {
  if (locale === 'jp') {
    return normalizeJapaneseCopyPayload(payload);
  }

  const template = DEFAULT_COPY_PAYLOADS[locale];
  const normalized = deepMergeTemplate(template, payload);
  migrateLegacyLocationCopy(locale, normalized);

  if (normalized.site.home.hero.ctaSchedule === 'Book Your Session') {
    normalized.site.home.hero.ctaSchedule = 'See dates and prices';
  }
  if (normalized.ui.home.bookTeamBuildingCta === 'Book Team Building') {
    normalized.ui.home.bookTeamBuildingCta = 'View Team-Building Options';
  }
  if (normalized.ui.themeDetail.upcomingClassesTitle === 'Upcoming {{name}} Classes') {
    normalized.ui.themeDetail.upcomingClassesTitle = 'Next {{name}} Classes';
  }
  if (
    normalized.ui.themeDetail.upcomingClassesSub ===
    'See what is available over the next seven days. Swipe to explore more dates.'
  ) {
    normalized.ui.themeDetail.upcomingClassesSub =
      'See the next scheduled classes. Swipe to explore more dates.';
  }
  const currentCancelFaqEn = DEFAULT_COPY_PAYLOADS.en.faqs.find(
    (faq) => faq.question === 'How can I cancel my session?',
  );
  normalized.faqs = normalized.faqs.map((faq) =>
    faq.question === 'How can I cancel my session?' &&
    faq.answer === LEGACY_CANCEL_FAQ_EN
      ? { ...faq, answer: currentCancelFaqEn?.answer ?? faq.answer }
      : faq,
  );

  normalized.blog = normalized.blog.map((item) => ({
    ...item,
    content: sanitizeBlogHtml(item.content),
  }));

  return normalized;
}

export function mergePublishedLocaleIntoContent(
  locale: CopyLocale,
  payload: LocalizedCopyPayload,
): ContentData {
  const content = structuredClone(defaultContent);
  content[locale] = deepMergeTemplate(defaultContent[locale], payload.site);

  const instructorsById = new Map(payload.instructors.map((item) => [item.id, item]));
  content.instructors = content.instructors.map((item) => {
    const copy = instructorsById.get(item.id);
    if (!copy) return item;
    return locale === 'en'
      ? { ...item, roleEn: copy.role, descEn: copy.desc }
      : { ...item, roleJp: copy.role, descJp: copy.desc };
  });

  const locationsById = new Map(payload.locations.map((item) => [item.id, item]));
  content.locations = content.locations.map((item) => {
    const copy = locationsById.get(item.id);
    if (!copy) return item;
    return locale === 'en'
      ? { ...item, nameEn: copy.name, addressEn: copy.address, accessEn: copy.access }
      : { ...item, nameJp: copy.name, addressJp: copy.address, accessJp: copy.access };
  });

  const blogById = new Map(payload.blog.map((item) => [item.id, item]));
  content.blog = content.blog.map((item) => {
    const copy = blogById.get(item.id);
    if (!copy) return item;
    return locale === 'en'
      ? {
          ...item,
          titleEn: copy.title,
          excerptEn: copy.excerpt,
          contentEn: sanitizeBlogHtml(copy.content),
          authorEn: copy.author,
        }
      : {
          ...item,
          titleJp: copy.title,
          excerptJp: copy.excerpt,
          contentJp: sanitizeBlogHtml(copy.content),
          authorJp: copy.author,
        };
  });

  return content;
}

export function mergePublishedIntoContent(payload: JapaneseCopyPayload): ContentData {
  return mergePublishedLocaleIntoContent('jp', payload);
}

export function buildResolvedCopy(locale: CopyLocale, payload: LocalizedCopyPayload): ResolvedJapaneseCopy {
  const legacyTeamBuildingRows = payload.teamBuildingLogisticsRows.length === TEAM_BUILDING_LOGISTICS_ROWS.length - 1;
  const daikanyamaIndex = TEAM_BUILDING_LOGISTICS_ROWS.findIndex(
    (item) => item.name.en === 'Artbar Daikanyama',
  );
  const getTeamBuildingLogisticsPayloadRow = (index: number) => {
    if (legacyTeamBuildingRows && daikanyamaIndex >= 0) {
      if (index === daikanyamaIndex) return undefined;
      if (index > daikanyamaIndex) return payload.teamBuildingLogisticsRows[index - 1];
    }

    return payload.teamBuildingLogisticsRows[index];
  };

  return {
    faqs: payload.faqs,
    teamBuildingTestimonials: payload.teamBuildingTestimonials,
    themePages: payload.themePages,
    locationShortLabels: LOCATION_SHORT_LABELS.map((item, index) => ({
      ...item,
      [locale]: payload.locationShortLabels[index] ?? item[locale],
    })),
    teamBuildingLogisticsRows: TEAM_BUILDING_LOGISTICS_ROWS.map((item, index) => {
      const payloadRow = getTeamBuildingLogisticsPayloadRow(index);

      return {
        ...item,
        name: {
          ...item.name,
          [locale]: payloadRow?.name ?? item.name[locale],
        },
        cap: {
          ...item.cap,
          [locale]: payloadRow?.cap ?? item.cap[locale],
        },
      };
    }),
    privatePartyCapacityRows: PRIVATE_PARTY_CAPACITY_ROWS.map((item, index) => ({
      ...item,
      name: {
        ...item.name,
        [locale]: payload.privatePartyCapacityRows[index]?.name ?? item.name[locale],
      },
      desc: {
        ...item.desc,
        [locale]: payload.privatePartyCapacityRows[index]?.desc ?? item.desc[locale],
      },
    })),
    ui: payload.ui,
  };
}

export function buildResolvedJapaneseCopy(payload: JapaneseCopyPayload): ResolvedJapaneseCopy {
  return buildResolvedCopy('jp', payload);
}
