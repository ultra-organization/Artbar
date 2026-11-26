import { REAL_PHOTOS, REAL_THEME_PHOTOS, type RealExample } from './real-photos';
/**
 * Public URLs for Gemini-generated assets under public/media/generated/.
 * Real instructor photos live under public/media/instructors/{id}-profile|banner.jpg.
 */
const g = (name: string) => `/media/generated/${name}`;

const instructorPhoto = (id: string) => ({
  profile: `/media/instructors/${id}-profile.jpg`,
  artwork: `/media/instructors/${id}-banner.jpg`,
});

/**
 * Slugs for `/media/instructors/{id}-*.jpg`. Keep in sync with row order in `constants.ts` (`INSTRUCTOR_ROWS`).
 * Add/remove ids here — `GI.instructors` and `scripts/image-manifest.ts` follow automatically.
 */
export const INSTRUCTOR_IDS = [
  'cathy',
  'naomi',
  'luci',
  'momo',
  'nanako',
  'kiyoe',
  'michi',
  'mineko',
  'sakura',
  'daria',
  'diamanteyuko',
  'rie',
  'ken',
  'naoko',
  'helen',
  'yuka',
  'jenna',
  'akiko',
  'minako',
  'akko',
  'glicinapeony',
] as const;

export type InstructorId = (typeof INSTRUCTOR_IDS)[number];

const instructorPhotos = Object.fromEntries(
  INSTRUCTOR_IDS.map((id) => [id, instructorPhoto(id)])
) as { [K in InstructorId]: ReturnType<typeof instructorPhoto> };

/** Keys match `THEME_CONFIG` in `views/ThemeDetail.tsx` (`texture-painting` URL resolves to `texture-art`). */
export const THEME_PAGE_SLUGS = [
  'japan-inspired',
  'van-gogh',
  'paint-pouring',
  'alcohol-ink',
  'monet',
  'picasso',
  'renoir',
  'matisse',
  'kids',
  'texture-art',
  'paint-your-pet',
  'paint-your-idol',
] as const;

export type ThemePageSlug = (typeof THEME_PAGE_SLUGS)[number];

function themePageImageSet(slug: string) {
  const real = REAL_THEME_PHOTOS[slug];
  if (real) {
    return { hero: real.hero, heroPortrait: real.heroPortrait, heroMobile: real.heroMobile, heroPosition: real.heroPosition, examples: real.examples, experience: real.experience };
  }
  return {
    hero: g(`theme-${slug}-hero.jpg`),
    heroMobile: undefined as string | undefined,
    heroPortrait: undefined as boolean | undefined,
    heroPosition: undefined as string | undefined,
    examples: [1, 2, 3, 4].map((n) => ({ src: g(`theme-${slug}-example-${n}.jpg`) })) as RealExample[],
    experience: g(`theme-${slug}-experience.jpg`),
  };
}

export const THEME_PAGE_IMAGES: Record<ThemePageSlug, ReturnType<typeof themePageImageSet>> = {
  'japan-inspired': themePageImageSet('japan-inspired'),
  'van-gogh': themePageImageSet('van-gogh'),
  'paint-pouring': themePageImageSet('paint-pouring'),
  'alcohol-ink': themePageImageSet('alcohol-ink'),
  monet: themePageImageSet('monet'),
  picasso: themePageImageSet('picasso'),
  renoir: themePageImageSet('renoir'),
  matisse: themePageImageSet('matisse'),
  kids: themePageImageSet('kids'),
  'texture-art': themePageImageSet('texture-art'),
  'paint-your-pet': themePageImageSet('paint-your-pet'),
  'paint-your-idol': themePageImageSet('paint-your-idol'),
};

export const GI = {
  heroTeamBuilding: g('hero-team-building.jpg'),
  /** Team Building page — curated activities (order matches `teamBuilding.activities.items`). */
  teamBuildingActivities: {
    paintSip: g('team-building-paint-sip.jpg'),
    collaborativeMural: g('team-building-collaborative-mural.jpg'),
    customWorkshop: REAL_PHOTOS.groupTeam,
  },
  conceptMain: g('concept-main.jpg'),
  conceptDetail: g('concept-detail.jpg'),
  featureAllInclusive: REAL_PHOTOS.materials,
  featureFreeFlowDrinks: g('feature-free-flow-drinks.jpg'),
  featureBilingual: g('feature-bilingual.jpg'),
  ctaBanner: REAL_PHOTOS.studioWide,
  themes: {
    japanInspired: g('theme-japan-inspired.jpg'),
    paintPouring: g('theme-paint-pouring.jpg'),
    paintYourPet: g('theme-paint-your-pet.jpg'),
    alcoholInk: g('theme-alcohol-ink.jpg'),
    vanGogh: g('theme-van-gogh.jpg'),
    monet: g('theme-monet.jpg'),
    picasso: g('theme-picasso.jpg'),
    renoir: g('theme-renoir.jpg'),
    matisse: g('theme-matisse.jpg'),
    kids: g('theme-kids.jpg'),
    texturePainting: g('theme-texture-painting.jpg'),
    paintYourIdol: g('theme-paint-your-idol.jpg'),
  },
  instructors: instructorPhotos,
  locations: {
    daikanyama: g('loc-daikanyama.jpg'),
    harajuku: g('loc-harajuku.jpg'),
    ginza: g('loc-ginza.jpg'),
    yokohama: g('loc-yokohama.jpg'),
    osaka_namba: g('loc-osaka-namba.jpg'),
    osaka_caso: g('loc-osaka-caso.jpg'),
    osaka_umeda: g('loc-osaka-umeda.jpg'),
    osaka_hirakata: g('loc-osaka-hirakata.jpg'),
    okinawa: g('loc-okinawa.jpg'),
  },
  privateOccasions: {
    birthday: g('private-birthday.jpg'),
    bachelorette: g('private-bachelorette.jpg'),
    kidsParty: g('private-kids-party.jpg'),
    anniversary: REAL_PHOTOS.coupleDate,
  },
  blog: {
    yokohamaCover: g('blog-yokohama-cover.jpg'),
    yokohamaInline: g('blog-yokohama-inline.jpg'),
  },
  testimonials: {
    ryan: g('testimonial-ryan.jpg'),
    ritsuko: g('testimonial-ritsuko.jpg'),
  },
} as const;
