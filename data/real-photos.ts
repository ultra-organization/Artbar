/**
 * Real Artbar photos (studio classes, guests and finished paintings), taken from the
 * event galleries on booking.artbar.co.jp and self-hosted under public/media/real/.
 * These replace every Gemini-generated image that used to show on the site.
 * Admin-published media (public/media/published/) still takes precedence where a slot has one.
 */
const r = (name: string) => `/media/real/${name}.webp`;
const pub = (slot: string, id: string) => `/media/published/${slot}/${id}/display.webp`;

const PUB = {
  picasso: pub('home.popularthemes.picasso', 'd80a6aae-0a9a-4371-9251-0474f4179dfc'),
  renoir: pub('home.popularthemes.renoir', '427df5d2-53b0-4565-96e3-7c9408aead47'),
  matisse: pub('home.popularthemes.matisse', 'ef6bf3ce-04ab-40db-a661-22f1fc24a357'),
  idol: pub('home.popularthemes.paint-your-idol', '7ec2a70d-8ca4-4551-b327-c19a6a33394e'),
  idolHero: pub('themes.paint-your-idol.hero', 'e2b89683-04e5-44ad-8d5c-88053b6e643f'),
  idolExperience: pub('themes.paint-your-idol.experience', '492abb58-2aaa-4fba-b3be-01ac3847f670'),
  alcoholInk: pub('home.popularthemes.alcohol-ink', 'a969c6aa-3149-4617-b3be-2e023440663c'),
  pouring: pub('home.popularthemes.paint-pouring', 'a2607676-f6bd-4709-bac4-3c31e0cc9cf9'),
  monet: pub('home.popularthemes.monet', 'b642752b-f765-45e9-a57b-55db7bbaa3bb'),
  vanGogh: pub('home.popularthemes.van-gogh', '2c6a7caa-624c-419e-93e3-368748147851'),
  japan: pub('home.popularthemes.japan-inspired', '9671e328-bb52-4d44-85ee-5b00388a1f4a'),
};

export type RealExample = { src: string; en?: string; ja?: string };

export type RealThemePhotos = {
  hero: string;
  /** Portrait crop for phones; falls back to `hero`. */
  heroMobile?: string;
  /** Hero is a portrait photo: shown as a mounted print on desktop. */
  heroPortrait?: boolean;
  /** Where the hero photo's subject sits, for `object-position`. */
  heroPosition?: string;
  experience: string;
  examples: RealExample[];
};

export const REAL_THEME_PHOTOS: Record<string, RealThemePhotos> = {
  'japan-inspired': { heroPortrait: true, hero: r('japan-hero'), heroMobile: r('japan-hero-m'), heroPosition: 'center 38%', experience: r('japan-exp'), examples: [{ src: r('japan-1'), en: "Fuji Van Gogh", ja: "ゴッホ風富士山" }, { src: r('japan-2'), en: "Pop-Art Hokusai’s Great Wave", ja: "ポップアート 葛飾北斎「神奈川沖浪裏」" }, { src: r('japan-3'), en: "Pop-Art Hokusai’s Great Wave", ja: "ポップアート 葛飾北斎「神奈川沖浪裏」" }, { src: r('japan-4'), en: "Ginkgo Leaves with Gold Lining", ja: "金の縁取りの銀杏の葉" }] },
  'van-gogh': { heroPortrait: true, hero: r('vangogh-hero'), heroPosition: 'center 45%', experience: r('vangogh-exp'), examples: [{ src: r('vangogh-1'), en: "Van Gogh: Café Terrace at Night, with Lights", ja: "ゴッホ「夜のカフェテラス」ライト付き" }, { src: r('vangogh-2'), en: "Van Gogh: Christmas Café Terrace", ja: "ゴッホ：クリスマスのカフェテラス" }, { src: r('vangogh-3'), en: "Textured Van Gogh Sunflowers", ja: "テクスチャーアート：ゴッホのひまわり" }, { src: PUB.vanGogh }] },
  'paint-pouring': { hero: r('pouring-hero'), heroMobile: r('pouring-hero-m'), heroPosition: 'center 45%', experience: r('pouring-exp'), examples: [{ src: r('pouring-1'), en: "Round Paint Pouring Fluid Art", ja: "40cm丸キャンバスのたらし込みアート" }, { src: PUB.pouring }, { src: r('pouring-2') }, { src: r('pouring-3') }] },
  'alcohol-ink': { heroPortrait: true, hero: r('ink-hero'), heroPosition: 'center 40%', experience: r('ink-exp'), examples: [{ src: r('ink-1'), en: "Alcohol Ink Art", ja: "アルコールインクアート" }, { src: PUB.alcoholInk }, { src: r('ink-2'), en: "Alcohol Ink Art", ja: "アルコールインクアート" }, { src: r('ink-3') }] },
  monet: { hero: r('monet-hero'), heroMobile: r('monet-hero-m'), heroPosition: 'center 40%', experience: r('monet-exp'), examples: [{ src: r('monet-1'), en: "Texture Art: Monet’s Water Lilies", ja: "テクスチャーアート：モネの睡蓮" }, { src: r('monet-2'), en: "Monet: Autumn Water Lilies", ja: "モネ：秋の睡蓮" }, { src: PUB.monet }, { src: r('monet-3'), en: "Texture Art: Monet’s Water Lilies", ja: "テクスチャーアート：モネの睡蓮" }] },
  picasso: { hero: r('picasso-hero'), heroMobile: r('picasso-hero-m'), heroPosition: 'center 35%', experience: r('picasso-exp'), examples: [{ src: r('picasso-1'), en: "Picasso Self-Portrait", ja: "ピカソ風自画像" }, { src: PUB.picasso }, { src: r('picasso-2'), en: "Picasso Self-Portrait", ja: "ピカソ風自画像" }] },
  renoir: { heroPortrait: true, hero: r('renoir-hero'), heroPosition: 'center 35%', experience: r('renoir-exp'), examples: [{ src: r('renoir-1'), en: "Renoir: Still Life with Flowers and Fruit", ja: "ルノワール「花と果物の静物画」" }, { src: PUB.renoir }] },
  matisse: { hero: r('matisse-hero'), heroPosition: 'center 40%', experience: r('matisse-exp'), examples: [{ src: r('matisse-1'), en: "Matisse: Lemons against a Pink Background", ja: "マティス「ピンクの背景にレモン」" }, { src: PUB.matisse }] },
  kids: { heroPortrait: true, hero: r('kids-hero'), heroPosition: 'center 30%', experience: r('kids-hero'), examples: [{ src: r('kids-1'), en: "Walrus", ja: "セイウチ" }, { src: r('kids-2'), en: "Mixed-Media Rooster and Sun", ja: "マルチメディアの雄鶏と太陽" }, { src: r('kids-3'), en: "Tokyo Tower Fingerpaint", ja: "東京タワーのフィンガーペイント" }, { src: r('kids-4'), en: "Chagall Christmas", ja: "シャガールのクリスマス" }] },
  'texture-art': { hero: r('texture-2'), experience: r('texture-3'), examples: [{ src: r('texture-1'), en: "Sculpture Painting: Poppies", ja: "スカルプチャーアート入門：ポピー" }, { src: r('texture-2'), en: "Sculpture Painting: Poppies", ja: "スカルプチャーアート入門：ポピー" }, { src: r('texture-3'), en: "Sculpture Painting: Poppies", ja: "スカルプチャーアート入門：ポピー" }, { src: r('texture-4'), en: "Savory Edible Texture Art", ja: "食べられるテクスチャーアート〈塩味〉" }] },
  'paint-your-pet': { heroPortrait: true, hero: r('pet-3'), experience: r('pet-4'), examples: [{ src: r('pet-1'), en: "Pop-Art Paint your Pet", ja: "ポップアートでペットを描こう" }, { src: r('pet-2'), en: "Pop-Art Paint your Pet", ja: "ポップアートでペットを描こう" }, { src: r('pet-3'), en: "Pop-Art Paint your Pet", ja: "ポップアートでペットを描こう" }, { src: r('pet-4'), en: "Pop-Art Paint your Pet", ja: "ポップアートでペットを描こう" }] },
  'paint-your-idol': { heroPortrait: true, hero: PUB.idolHero, experience: PUB.idolExperience, examples: [{ src: PUB.idol }, { src: PUB.idolHero }, { src: PUB.idolExperience }] },
};

/** Real replacements for the generic generated photos used on home, guides and seasonal pages. */
export const REAL_PHOTOS = {
  materials: r('materials'),
  studioWide: r('studio-wide'),
  coupleDate: r('couple-date'),
  groupTeam: r('group-team'),
  groupPicasso: r('group-picasso'),
  groupSunflowers: r('group-sunflowers'),
  classSmile: r('class-smile'),
  classLaugh: r('class-laugh'),
  classBrush: r('class-brush'),
  coupleSunflowers: r('couple-sunflowers'),
  friendsWine: r('friends-wine'),
};
