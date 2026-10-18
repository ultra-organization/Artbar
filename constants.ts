import { Instructor, Location, Testimonial, MediaItem } from './types';
import { GI, INSTRUCTOR_IDS, type InstructorId } from './data/generated-image-paths';

type InstructorRow = Omit<Instructor, 'profileImage' | 'artworkImage'> & { id: InstructorId };

function attachInstructorPhotos(row: InstructorRow): Instructor {
  const photos = GI.instructors[row.id];
  return { ...row, profileImage: photos.profile, artworkImage: photos.artwork };
}

/**
 * Tiny base64 placeholder for hero images — shows a dark blurred hint instantly while the real
 * image loads, removing the "blank → pop-in" flash.  Use with `<Image placeholder="blur" blurDataURL={HERO_BLUR_DATA_URL} …/>`.
 */
export const HERO_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwEE/8QAHBAAAQMFAAAAAAAAAAAAAAAAAAECMQMEBRFB/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEQA/AIuQ2gbrxy8MTpGpQCPZU0v/2Q==';

/** Default hero background image (served from /public/media) when not using MP4; also used as video `poster`. */
export const HERO_HOME_FALLBACK = '/media/gemini-hero-background.jpeg';

/** Full-bleed home hero looping videos (`public/media/`). */
export const HERO_HOME_VIDEO_DESKTOP = '/media/artbar-home-video-desktop.mp4';
export const HERO_HOME_VIDEO_MOBILE = '/media/artbar-home-video-mobile.mp4';

/** Replace @PLACEHOLDER_ID with your LINE official account ID when ready. */
export const LINE_ADD_FRIEND_URL = 'https://line.me/R/ti/p/@PLACEHOLDER_ID';

/** Public booking engine for all schedule and booking CTAs. */
export const ARTBAR_BOOKING_URL = 'https://booking.artbar.co.jp';
/** Painta embed host; production uses Artbar's tenant storefront, local QA can point at port 3001. */
export const PAINTA_EMBED_ORIGIN =
  process.env.NEXT_PUBLIC_PAINTA_EMBED_ORIGIN?.replace(/\/$/, '') || ARTBAR_BOOKING_URL;
const ARTBAR_BOOKING_THEME_FILTERS: Record<string, { category: string; query?: string }> = {
  'japan-inspired': { category: 'japan-inspired' },
  'paint-pouring': { category: 'paint-pouring' },
  'paint-your-pet': { category: 'paint-your-pet' },
  'alcohol-ink': { category: 'alcohol-ink' },
  'van-gogh': { category: 'master-artists', query: 'van gogh,van-gogh,ゴッホ' },
  monet: { category: 'master-artists', query: 'monet,モネ' },
  picasso: { category: 'master-artists', query: 'picasso,ピカソ' },
  renoir: { category: 'master-artists', query: 'renoir,ルノワール' },
  matisse: { category: 'master-artists', query: 'matisse,マティス' },
  kids: { category: 'kids-only' },
  'texture-painting': { category: 'textured' },
  'paint-your-idol': { category: 'pop-art' },
};

const getArtbarBookingThemeFilter = (themeSlug: string) =>
  ARTBAR_BOOKING_THEME_FILTERS[themeSlug] ?? { category: themeSlug };

export const getArtbarBookingThemeUrl = (themeSlug: string): string => {
  const { category } = getArtbarBookingThemeFilter(themeSlug);
  return `${ARTBAR_BOOKING_URL}/themes/${encodeURIComponent(category)}`;
};

export const getArtbarThemeScheduleEmbedUrl = (
  themeSlug: string,
  locale: 'en' | 'ja',
): string => {
  const { category, query } = getArtbarBookingThemeFilter(themeSlug);
  const params = new URLSearchParams({
    locale,
    category,
    limit: '4',
    layout: 'rail',
    fallback: 'strict',
    headings: 'hide',
    cta: 'hide',
    background: 'transparent',
  });

  if (query) params.set('query', query);

  return `${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/upcoming?${params.toString()}`;
};

/** Painta studio IDs for every Tokyo, Yokohama and Osaka studio on this site. */
export const ARTBAR_BOOKING_LOCATION_IDS: Record<string, string[]> = {
  daikanyama: ['18244ebb-1fb3-4cb0-9479-fa8ebd32d380'],
  harajuku: ['7b324032-63e9-4675-aa67-6fdb7773615e'],
  ginza: ['04f186c0-7603-4d89-ab02-4ec22066df2b'],
  osaka_namba: ['2fd6cb8b-a5aa-4a86-93b3-e5448aa8a43a'],
  osaka_umeda: ['46a6071f-a389-4a9d-9e5f-fbaa1993a20d'],
  osaka_hirakata: ['1574c96e-cf2b-4877-b87b-fc56204d0ec8'],
  yokohama: [
    '76752feb-31ed-4505-a068-8363bbeb576c',
    'a08ed9ba-04d3-4e21-8ce5-e625c544df5c',
  ],
};

export const getArtbarLocationScheduleEmbedUrl = (
  locationSlug: string,
  locale: 'en' | 'ja',
): string | null => {
  const locationIds = ARTBAR_BOOKING_LOCATION_IDS[locationSlug];
  if (!locationIds) return null;

  const params = new URLSearchParams({
    locale,
    location: locationIds.join(','),
    range: 'week',
    limit: '6',
    layout: 'rail',
    fallback: 'strict',
    headings: 'hide',
    cta: 'hide',
    background: 'transparent',
  });

  const isOsaka = locationSlug.startsWith('osaka_');
  const origin = isOsaka
    ? (process.env.NEXT_PUBLIC_PAINTA_EMBED_ORIGIN?.replace(/\/$/, '') || 'https://tickets.artbar.co.jp')
    : PAINTA_EMBED_ORIGIN;
  const businessSlug = isOsaka ? 'artbar-osaka' : 'artbar-tokyo';
  return `${origin}/embed/${businessSlug}/upcoming?${params.toString()}`;
};
export const ARTBAR_OSAKA_URL = 'https://osaka.artbar.co.jp';
export const PRIVATE_PARTY_INQUIRY_URL = `${ARTBAR_BOOKING_URL}/inquiries?type=private_party`;
export const TEAM_BUILDING_INQUIRY_URL = `${ARTBAR_BOOKING_URL}/inquiries?type=team_building`;

/** Official LINE app mark (squircle); sits on #06C755 so colors align. Served from /public/media. */
export const LINE_BRAND_ICON_SRC = '/media/LINE_Brand_icon.png';

/** Tokyo studio inbox (footer mail, Paint Your Pet sketch “email for class”). */
export const ARTBAR_TOKYO_EMAIL = 'tokyo@artbar.co.jp';

/** Full promo / lifestyle video on YouTube — home concept block “play” opens this in a new tab. */
export const CONCEPT_BLOCK_YOUTUBE_URL = 'https://www.youtube.com/watch?v=wLjhqJ8v_Bs';

/**
 * Public social profiles. Used by the Footer icon row and by Organization.sameAs
 * in JSON-LD — keep them in sync by editing here.
 */
export const SOCIAL_PROFILES = {
  instagram: 'https://www.instagram.com/artbartokyo/',
  facebook: 'https://www.facebook.com/artbartokyo/',
  tiktok: 'https://www.tiktok.com/@artbartokyo',
  youtube: 'https://www.youtube.com/@artbartokyo4258',
} as const;

export const SOCIAL_PROFILE_URLS: readonly string[] = Object.values(SOCIAL_PROFILES);

/** AI-generated illustrative company group, based on the booking studio reference. */
export const GROUP_EVENT_IMAGE = '/media/generated/home-company-party.png';

export const SITE_IMAGES = {
  hero: {
    /** Default full-bleed hero: desktop MP4; pair with `homeMobile` for `<source media>`. */
    home: HERO_HOME_VIDEO_DESKTOP,
    homeMobile: HERO_HOME_VIDEO_MOBILE,
    teamBuilding: GI.heroTeamBuilding,
    video: HERO_HOME_VIDEO_DESKTOP,
    videoMobile: HERO_HOME_VIDEO_MOBILE,
  },
  concept: {
    main: GI.conceptMain,
    detail: GI.conceptDetail
  },
  features: {
    drink: GI.featureFreeFlowDrinks,
    guide: GI.featureAllInclusive,
    bilingual: GI.featureBilingual
  },
  privateParties: {
    wine: GI.featureFreeFlowDrinks,
    materials: GI.featureAllInclusive,
    instruction: GI.featureBilingual,
  },
  cta: GI.ctaBanner,
};

/** Order matches `site.teamBuilding.activities.items` (EN/JP same sequence). */
export const TEAM_BUILDING_ACTIVITY_IMAGES = [
  GI.teamBuildingActivities.paintSip,
  GI.teamBuildingActivities.collaborativeMural,
  GI.teamBuildingActivities.customWorkshop,
];

export type PartnerLogoAsset = {
  name: string;
  url: string;
  width: number;
  height: number;
};

/** Self-hosted partner marks. Home + team building. */
export const PARTNER_LOGOS: PartnerLogoAsset[] = [
  { name: "Coca-Cola", url: "/brand/partners/coca-cola.svg", width: 615, height: 193 },
  { name: "Amazon", url: "/brand/partners/amazon.svg", width: 603, height: 182 },
  { name: "Adidas", url: "/brand/partners/adidas.svg", width: 725, height: 500 },
  { name: "Google", url: "/brand/partners/google.svg", width: 272, height: 92 },
  { name: "L'Oreal", url: "/brand/partners/loreal.svg", width: 800, height: 145 },
  { name: "Nike", url: "/brand/partners/nike.svg", width: 1000, height: 356 },
  { name: "Bloomberg", url: "/brand/partners/bloomberg.svg", width: 300, height: 60 },
  { name: "Spotify", url: "/brand/partners/spotify.svg", width: 559, height: 168 },
  { name: "Netflix", url: "/brand/partners/netflix.svg", width: 1024, height: 277 },
  { name: "Morrison Foerster", url: "/brand/partners/morrison-foerster.svg", width: 265, height: 63 },
  { name: "GE", url: "/brand/partners/ge.svg", width: 500, height: 500 },
  { name: "LUMINE", url: "/brand/partners/lumine.svg", width: 180, height: 40 },
  { name: "Apple", url: "/brand/partners/apple.svg", width: 814, height: 1000 },
  { name: "Toyota", url: "/brand/partners/toyota.svg", width: 60, height: 39 },
];

export const POPULAR_THEMES = [
  { slug: "japan-inspired", title: "Japan Inspired", desc: "Sakura, Mount Fuji & traditional motifs", image: GI.themes.japanInspired },
  { slug: "paint-pouring", title: "Paint Pouring", desc: "Fluid art & mesmerizing cells", image: GI.themes.paintPouring },
  { slug: "paint-your-pet", title: "Paint Your Pet", desc: "Immortalize your furry friend", image: GI.themes.paintYourPet },
  { slug: "alcohol-ink", title: "Alcohol Ink", desc: "Ethereal & dreamy abstract art", image: GI.themes.alcoholInk },
  { slug: "van-gogh", title: "Van Gogh", desc: "Starry nights & sunflower fields", image: GI.themes.vanGogh },
  { slug: "monet", title: "Monet", desc: "Impressionist gardens & water lilies", image: GI.themes.monet },
  { slug: "picasso", title: "Picasso", desc: "Cubist portraits & bold expressions", image: GI.themes.picasso },
  { slug: "renoir", title: "Renoir", desc: "Soft light & romantic scenes", image: GI.themes.renoir },
  { slug: "matisse", title: "Matisse", desc: "Vibrant colors & expressive forms", image: GI.themes.matisse },
  { slug: "kids", title: "Kids!", desc: "Fun & simple designs for young artists", image: GI.themes.kids },
  { slug: "texture-painting", title: "Texture Painting", desc: "Sculptural & dimensional art", image: GI.themes.texturePainting },
  { slug: "paint-your-idol", title: "Paint Your Idol", desc: "Celebrate your favorite icon", image: GI.themes.paintYourIdol },
];

/** Manual `<wbr>` markers on katakana compound titles give text-wrap: balance
 *  a phrase boundary to use; BudouX returns these as single chunks. See
 *  components/JpText.tsx for how the markers are honored. */
export const POPULAR_THEMES_JP = [
  { slug: "japan-inspired", title: "ジャパン<wbr>インスパイア", desc: "桜や富士山など、日本らしいモチーフ", image: GI.themes.japanInspired },
  { slug: "paint-pouring", title: "ポーリング<wbr>アート", desc: "流れる絵の具が生む幻想的な模様", image: GI.themes.paintPouring },
  { slug: "paint-your-pet", title: "ペットを<wbr>描こう", desc: "大切な家族をキャンバスに残す", image: GI.themes.paintYourPet },
  { slug: "alcohol-ink", title: "アルコール<wbr>インク", desc: "にじみと透明感が美しい抽象アート", image: GI.themes.alcoholInk },
  { slug: "van-gogh", title: "ゴッホ", desc: "星月夜やひまわりの世界観を楽しむ", image: GI.themes.vanGogh },
  { slug: "monet", title: "モネ", desc: "印象派の庭園や睡蓮をやさしく表現", image: GI.themes.monet },
  { slug: "picasso", title: "ピカソ", desc: "大胆な形と色で描くキュビズム", image: GI.themes.picasso },
  { slug: "renoir", title: "ルノワール", desc: "やわらかな光に包まれた優雅な絵", image: GI.themes.renoir },
  { slug: "matisse", title: "マティス", desc: "鮮やかな色と自由なフォルムを楽しむ", image: GI.themes.matisse },
  { slug: "kids", title: "キッズ", desc: "子どもたちが楽しく描ける人気テーマ", image: GI.themes.kids },
  { slug: "texture-painting", title: "テクスチャー<wbr>アート", desc: "立体感のある質感を楽しむモダンアート", image: GI.themes.texturePainting },
  { slug: "paint-your-idol", title: "推しを描こう", desc: "大好きなアイコンや推しを作品に", image: GI.themes.paintYourIdol },
];

/** Bios only; image URLs come from `INSTRUCTOR_IDS` + `GI.instructors` (see `data/generated-image-paths.ts`). */
const INSTRUCTOR_ROWS: InstructorRow[] = [
  {
    id: "cathy",
    name: "Cathy Thompson",
    roleEn: "CEO Artbar Tokyo",
    roleJp: "Artbar Tokyo CEO",
    descEn: "Cathy is Artbar Tokyo's CEO - the driving force behind Artbar! She strives to make it a fun and relaxing space for people to express their creative self and spark their love for art. Although most of her work is behind the scenes, she is often in the studio and looks forward to meeting you at any of our sessions.",
    descJp: "Artbar Tokyoの創設者兼CEO。Artbarが単なる絵画教室ではなく、誰もがクリエイティビティを解放できる「大人のサードプレイス」であり続けるよう情熱を注いでいます。スタジオ運営の指揮を執りながら、ゲストの皆様とアートを通じた時間を共有することを楽しみにしています。",
    languages: "English, Japanese"
  },
  {
    id: "naomi",
    name: "Naomi",
    roleEn: "Marketing Director",
    roleJp: "マーケティング・ディレクター",
    descEn: "Naomi is both an instructor and Artbar's marketing director. She shapes the image of Artbar and finds or creates new trends to keep Artbar exciting! She is very friendly and will make your session lots of fun. Come try some of her new abstract sessions such as paint pour or alcohol inks, or learn detailed techniques with classic paintings together.",
    descJp: "インストラクターとマーケティングディレクターを兼務し、常にArtbarの新しいトレンドを発信しています。ポーリングアートやアルコールインクなどのモダンなスタイルから、古典的な名画のテクニックまで幅広く精通。親しみやすい人柄で、リラックスしたセッションを提供します。",
    languages: "English, Japanese"
  },
  {
    id: "luci",
    name: "Luci",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Luci brings a soft, dreamy style to his paintings that will make you feel like you're transported to a fantasyland of colorful sunsets and milky ways! He loves to encourage people to find their own style during his sessions, Luci's calming guidance will make you feel relaxed and creative. Come paint along with him sometime and unleash your creativity.",
    descJp: "ファンタジーの世界へ迷い込んだような、柔らかく色彩豊かなスタイルが特徴のアーティスト。ゲスト一人ひとりが独自のスタイルを見つけられるよう、穏やかな雰囲気の中で丁寧にガイドします。日常を忘れ、クリエイティビティを解放する時間をお楽しみください。",
    languages: "English, Japanese, Chinese"
  },
  {
    id: "momo",
    name: "Momo",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Momo is an awesome instructor and specializes in her original dot technique art style and abstract art! She is also very bright and knows a lot about different paint mediums, she offers extremely good advice about color theory! Come join her class sometime and get to learn about her unique style.",
    descJp: "国内外で活躍する現役アーティスト。独自のドットテクニックや抽象画を専門とし、色彩理論や画材に関する深い知識を持っています。プロフェッショナルな視点からのアドバイスで、あなたの作品作りをサポートします。",
    languages: "English, Japanese"
  },
  {
    id: "nanako",
    name: "Nanako",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Nanako's specialty is Japanese painting and acrylic painting. She is very helpful if you have questions about your painting process. She will happily give you great advice so you can feel confident in your masterpiece!",
    descJp: "日本画とアクリル画を中心に制作活動を行っています。「その瞬間の感情」を大切に、自由に表現することを重視したセッションです。繊細な色使いを得意とし、皆様が思いのままに個性を発揮できるよう技術面でもサポートします。",
    languages: "Japanese"
  },
  {
    id: "kiyoe",
    name: "Kiyoe",
    roleEn: "Pottery Specialist",
    roleJp: "陶芸スペシャリスト",
    descEn: "Kiyoe is a pottery specialist and makes her amazing art and designs from scratch such as plates, cups, pots, and many other works of art! Kiyoe has the sweetest and kindest soul - she teaches both kids and adults sessions so you'll never feel worried, always at ease.",
    descJp: "陶芸を専門とし、器やポットなど温かみのある作品を制作しています。とても穏やかな人柄で、大人のセッションからキッズセッションまで幅広く担当。土に触れて心を落ち着けたい方、リラックスしたい方におすすめです。",
    languages: "English, Japanese"
  },
  {
    id: "michi",
    name: "Michi Kim",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Michi creates lots of fun paintings for many of Artbar's kids sessions! Her bright and energetic atmosphere will be sure to make your kids smile while they create masterpieces to decorate the house with. Leave it to Michi Sensei to guide your kids in a fun way during their art class!",
    descJp: "Artbarのキッズセッションを中心に、多くの作品を生み出しています。明るくエネルギッシュなMichi先生は、子供たちの自由な発想と笑顔を引き出すのが得意です。お子様の初めてのアート体験は、ぜひMichiにお任せください。",
    languages: "English, Japanese, Korean"
  },
  {
    id: "mineko",
    name: "Mineko",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "A graduate of Bunka Fashion College, Mineko has worked for many years in apparel fashion and the accessories industry, and has published a recipe book for bead accessories she designed herself. Her accessories feature cheerful, colorful tones that also come through in her paintings. Mineko loves animals and fantasy worlds, and creates illustrations that feel like scenes from a storybook. In kids classes she supports everyone so you can enjoy painting together.",
    descJp: "文化服装学院卒。長年アパレルファッション業界、アクセサリーパーツ業界を経て自らデザインしたビーズアクセサリーのレシピ本も発売しています。アクセサリーは元気が出るようなカラフルな色が特徴で、それは絵にも表れています。Minekoは動物とファンタジーの世界感が大好きで、物語に登場するようなイラストを描きます。キッズクラスでは皆で楽しく描けるようサポートいたします！",
    languages: "Japanese"
  },
  {
    id: "sakura",
    name: "Sakura",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Graduate of University of Tsukuba, Art & Design Department, majoring in Japanese-style painting; Tokyo University of the Arts, Master of Art studies (Art Education, current). Sakura specializes in Japanese painting but is also a multi-style artist who creates 3D works using acrylic paints. Her experience living in Germany and riding horses at university encourage her to paint horses and other animals in a colorful, energetic way. She is looking for you to join her fantasy world and enjoy art!",
    descJp: "筑波大学芸術専門学群日本画領域卒業、東京藝術大学院美術研究科修士課程在籍中。Sakuraは日本画を専門としていますが、アクリル絵の具を使った立体表現も行うマルチスタイルアーティストです。ドイツに住んでいた経験や大学で馬術をしていたことから馬をはじめとした動物を表現するのが得意で、カラフルでエネルギッシュな色使いをします。アートを楽しみながらメルヘンの世界に飛び込んでくれる仲間をお待ちしています！",
    languages: "English, Japanese, German"
  },
  {
    id: "daria",
    name: "Daria",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Daria is an Italian artist who studied painting in Florence. She is an illustrator with a oneiric style and likes to experiment with different materials and techniques. She believes art is a powerful tool to self-reflect and be yourself, but also to connect with others. During her classes she will passionately encourage you to express your creativity without limits, feeling free from all inhibitions and worries!",
    descJp: "Leon Battista Alberti（フィレンツェ）、International School of Illustration Štěpán Zavřel（サルメーデ）、Ca' Foscari University（ヴェネツィア）などで学んだイタリア人アーティスト。オネアリスティックなスタイルのイラストレーターで、さまざまな素材や技法を試すのが好き。アートは自分を見つめ直し、自分らしくいるための強力なツールであると同時に、他者とつながるためのツールでもあると信じている。彼女のクラスでは、すべての抑制や心配から解放され、制限なく創造性を表現できるよう、情熱的に励まします！",
    languages: "English, Japanese, Italian"
  },
  {
    id: "diamanteyuko",
    name: "Diamante Yuko",
    roleEn: "Candle artist",
    roleJp: "キャンドルアーティスト",
    descEn: "Yuko is a candle artist and will gently teach you how to make your own aroma and art candles during our Craft Morning workshops!",
    descJp: "クラフトモーニングのワークショップでは、キャンドルアーティストであるユウコさんが、アロマキャンドルやアートキャンドルの作り方を優しく教えてくれます！",
    languages: "Japanese"
  },
  {
    id: "rie",
    name: "Rie",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Rie specializes in alcohol ink art and resin art. She also organizes workshops that give people a chance of self-reflection through art. Rie's bright personality and passion for supporting students to express themselves through art will guide you to create your own masterpiece!",
    descJp: "Rieはアルコールインクアートとレジンアートを専門とする先生です。彼女は普段、アートと心理学を組み合わせて、アートを通じた自己対話や自分発見のワークショップも開催しています！Artbarでは、持ち前の明るさと丁寧なフォローで、楽しみながらみなさんが表現したいアートを一緒に叶えてくれます！是非、彼女のセッションに参加してオリジナルアートを作りましょう！",
    languages: "English, Japanese"
  },
  {
    id: "ken",
    name: "Ken Tanaka",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Ken specializes in his signature pen drawings that are so detailed and whimsical. Ken is knowledgeable not only about art but about many very interesting subjects, which makes it so much fun to chat together! Come feel inspired with Ken, you will learn about art and much more.",
    descJp: "Kenの得意とするペンを使ったドローイングを教えてくれます。アートだけではなくあらゆる事に精通しているのでお話をしているだけでもとっても楽しい先生です。Kenのセッションに参加して新しいアートの技法を学びましょう！",
    languages: "English, Japanese"
  },
  {
    id: "naoko",
    name: "Naoko",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Naoko hopes you can enjoy expressing yourself freely through your work. She also hopes that after experiencing making art, you will feel interested in visiting museums and exploring art further.",
    descJp: "武蔵野美術大学短期大学部卒業。Naoko先生は生徒の皆さんに作品を通して自由に表現する事を楽しんでいただける時間にしたいと考えています。アートを体験する事をきっかけに美術館に行くことや、芸術に興味を持ってもらえたら嬉しいです。",
    languages: "Japanese"
  },
  {
    id: "helen",
    name: "Helen",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Helen is a very calm and caring instructor who will gently guide you through the session so you can have a relaxing time.",
    descJp: "Helenはとても穏やかで思いやりのあるインストラクターで、皆様がリラックスした時間を過ごせるよう、優しく指導してくれます。",
    languages: "English, Japanese, Thai"
  },
  {
    id: "yuka",
    name: "Yuka",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Yuka is a very kind teacher and will guide the class gently - the students can feel relaxed and free to express themselves through their art. Yuka specializes in children's book illustrations and her colorful artwork is absolutely lovely!",
    descJp: "日本児童教育専門学校 絵本童話科 卒業。Yukaはとても親切な先生で、クラスを優しく指導してくれます。生徒さんはリラックスして、自由にアートを通して自分を表現することができます。Yukaは児童書のイラストを専門としており、彼女のカラフルなアートワークはとても素敵です。",
    languages: "English, Japanese"
  },
  {
    id: "jenna",
    name: "Jenna",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Jenna specializes in crafting colorful and relaxing pieces inspired by the beauty of nature. Her goal is to make everyone feel calm, happy, and inspired during their time in class. Whether you're seeking a peaceful escape or simply looking to explore your creativity, Jenna's classes provide the perfect opportunity to unwind and reconnect with nature through art. Come join us and experience the joy of painting with Jenna!",
    descJp: "University of Hamburg、学習院女子大学。ジェナは、自然の美しさにインスパイアされた、カラフルでリラックスできる作品を作るのが専門。彼女のゴールは、クラスで過ごしている間、誰もが穏やかで幸せな気持ちになり、インスピレーションを得られるようにすること。穏やかなひとときを過ごしたい方にも、自分の創造性を探求したい方にも、ジェナのクラスは、アートを通してくつろぎ、自然とのつながりを取り戻す絶好の機会を提供します。ジェナと一緒に絵を描く楽しさを体験してみませんか？",
    languages: "English, Japanese, German"
  },
  {
    id: "akiko",
    name: "Akiko",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Graduate of Musashino Art University, Department of Japanese Painting. Akiko is good at creating colorful and exciting pieces. She has been involved in various illustrations. Akiko also loves copying and understands the importance of learning from copying. Whether you've never had much experience with art or just love art, join Akiko in her class and have fun creating art with someone who is always calm and natural.",
    descJp: "武蔵野美術大学 日本画学科卒業。Akikoはカラフルでワクワクする作品を作るのが得意です。今まで様々なイラストを担ってきました。Akikoはまた模写をする事が大好きで、模写から学ぶ事の大切さも心得ています。いつも穏やかで自然体のAkikoと一緒に、アートに今まであまり触れてこなかった人も、アートが大好きという方もAkikoのクラスで一緒に楽しく作品作りを体験してみませんか？",
    languages: "English, Japanese"
  },
  {
    id: "minako",
    name: "Minako",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "MA in Illustration at Kingston University, London; BA in Visual Communication Design at Musashino Art University. Minako has worked as a package designer, graphic designer, illustrator, and jewelry maker. She is now a printmaker and art educator, active in Japan, the UK, Slovenia, and Italy. Join her unique art style classes and enjoy expressing yourself. Especially for kids, Minako's classes are full of fun and creativity, as she loves working with children!",
    descJp: "キングストン大学院修士課程イラストレーション科卒業、武蔵野美術大学視覚伝達デザイン学科卒業。ミナコは、パッケージデザイナー、グラフィックデザイナー、イラストレーター、ジュエリーメーカーとして活躍した後、現在は日本、イギリス、スロベニア、イタリアで版画家兼アートエデュケーターとして活動しています。彼女のユニークなアートスタイルのクラスに参加し、自己表現を楽しんでください。特に子供が大好きなミナコのキッズクラスは、楽しさ満載です！",
    languages: "English, Japanese"
  },
  {
    id: "akko",
    name: "Akko",
    roleEn: "Instructor",
    roleJp: "インストラクター",
    descEn: "Education: Media and Communication at London School of Economics and Political Science (LSE), 2021; Woodworking Traditional Arts Super College of Kyoto, 2025. Akko creates work with acrylic paints, often featuring animals and original patterns in the background to express her inner self. She loves the freedom that painting offers and does her best to make the class fun and relaxing.",
    descJp: "2021年 LSE メディア・コミュニケーション、2025年 京都伝統木工芸スーパー専門学校。アクリル絵の具を使って作品を制作しています。モチーフには動物を取り入れることが多く、背景にはオリジナルの模様を描くことで、自分自身を表現しています。絵を描くことの自由さがとても好きで、クラスでは楽しく、リラックスできる雰囲気づくりを心がけています。",
    languages: "English, Japanese"
  },
  {
    id: "glicinapeony",
    name: "Glicina Peony",
    roleEn: "Craft partner",
    roleJp: "クラフトパートナー",
    descEn: "Glicina Peony is a craft partner that specializes in dried flower arrangements and wreaths.",
    descJp: "グリシーナ・ピオニーは、ドライフラワーのアレンジメントやリースを専門に扱うクラフトパートナーです。",
    languages: "Japanese"
  }
];

export const INSTRUCTORS: Instructor[] = INSTRUCTOR_ROWS.map(attachInstructorPhotos);

if (process.env.NODE_ENV === 'development') {
  const rowIds = INSTRUCTOR_ROWS.map(r => r.id);
  if (
    rowIds.length !== INSTRUCTOR_IDS.length ||
    INSTRUCTOR_IDS.some((id, i) => id !== rowIds[i])
  ) {
    console.error(
      '[Artbar] INSTRUCTOR_ROWS order does not match INSTRUCTOR_IDS — preload/priority hints will be misaligned.\n' +
      'INSTRUCTOR_IDS: ' + INSTRUCTOR_IDS.join(', ') + '\n' +
      'INSTRUCTOR_ROWS: ' + rowIds.join(', ')
    );
  }
}

/** Short area names for footer / capacity grids (`row[lang]`). Distinct from full `LOCATIONS` entries. */
export const LOCATION_SHORT_LABELS = [
  { en: 'Daikanyama', jp: '代官山' },
  { en: 'Cat Street Harajuku', jp: '原宿キャットストリート' },
  { en: 'Ginza', jp: '銀座' },
  { en: 'Yokohama Motomachi', jp: '横浜元町' },
  { en: 'Osaka', jp: '大阪' },
] as const;

export const OFFSITE_LABEL = { en: 'Offsite', jp: '出張' } as const;

/** Team building logistics column — studio rows + offsite. */
export const TEAM_BUILDING_LOGISTICS_ROWS: {
  name: { en: string; jp: string };
  cap: { en: string; jp: string };
}[] = [
  { name: { en: 'Artbar Ginza', jp: 'Artbar Ginza' }, cap: { en: 'Max 30', jp: '最大30名' } },
  {
    name: { en: 'Artbar Cat Street Harajuku', jp: 'Artbar Cat Street Harajuku' },
    cap: { en: 'Max 20', jp: '最大20名' },
  },
  { name: { en: 'Artbar Daikanyama', jp: 'Artbar Daikanyama' }, cap: { en: 'Max 12', jp: '最大12名' } },
  { name: { en: 'Artbar Yokohama', jp: 'Artbar Yokohama' }, cap: { en: 'Max 40', jp: '最大40名' } },
  {
    name: { en: 'Your Office / Offsite', jp: 'Your Office / Offsite' },
    cap: { en: '15 - 100+ Guests', jp: '15〜100名以上' },
  },
];

/** Private parties capacity grid — matches marketing short names + offsite. */
export const PRIVATE_PARTY_CAPACITY_ROWS: {
  name: { en: string; jp: string };
  cap: string;
  desc: { en: string; jp: string };
  highlight?: boolean;
}[] = [
  {
    name: { en: 'Daikanyama', jp: '代官山' },
    cap: '12',
    desc: { en: 'Cozy & Intimate', jp: 'あたたかみのある空間' },
  },
  {
    name: { en: 'Harajuku', jp: '原宿' },
    cap: '20',
    desc: { en: 'Cat Street View', jp: 'キャットストリート沿い' },
  },
  {
    name: { en: 'Ginza', jp: '銀座' },
    cap: '30',
    desc: { en: 'Elegant Studio', jp: 'エレガントなスタジオ' },
  },
  {
    name: { en: 'Yokohama', jp: '横浜' },
    cap: '40',
    desc: { en: 'Spacious & Bright', jp: '広く明るい空間' },
  },
  {
    name: { en: 'Offsite', jp: '出張' },
    cap: '100+',
    desc: { en: 'We come to you', jp: 'ご指定の会場へ' },
    highlight: true,
  },
];

/**
 * Per-studio coordinates are approximate (~50m), derived from the registered
 * street address. Tighten by replacing with the exact lat/long from each
 * mapUrl when convenient.
 */
export const LOCATIONS: Location[] = [
  {
    id: "daikanyama",
    nameEn: "Artbar Daikanyama",
    nameJp: "Artbar 代官山",
    addressEn: "7-2 Daikanyamachō, Shibuya, Tōkyō 150-0034. Belleview Daikanyama Bld 1fl.",
    addressJp: "〒150-0034 東京都渋谷区代官山町 7-2 ベルビュー代官山 1階",
    accessEn: "Tokyu Toyoko Line Daikanyama Station: about 5 minutes on foot\nEbisu Station: about 8 minutes on foot",
    accessJp: "東急東横線 代官山駅から徒歩約5分\n恵比寿駅から徒歩約8分",
    image: GI.locations.daikanyama,
    mapUrl: "https://maps.app.goo.gl/1bAmzeGXqq5m4jSY7",
    geo: { latitude: 35.6499, longitude: 139.7029 }
  },
  {
    id: "harajuku",
    nameEn: "Artbar Cat Street Harajuku",
    nameJp: "Artbar キャットストリート原宿",
    addressEn: "Takara Building 201, 5-30-2 Jingumae, Shibuya-ku, Tokyo 150-0001",
    addressJp: "〒150-0001 東京都渋谷区神宮前5-30-2 Takaraビル 201",
    accessEn: "Tokyo Metro Meiji-jingumae Station: about 5 minutes on foot\nShibuya Station: about 7 minutes on foot",
    accessJp: "東京メトロ 明治神宮前駅から徒歩約5分\n渋谷駅から徒歩約7分",
    image: GI.locations.harajuku,
    mapUrl: "https://maps.app.goo.gl/oktBHrayLwCaZFbV8",
    geo: { latitude: 35.6661, longitude: 139.7058 }
  },
  {
    id: "ginza",
    nameEn: "Artbar Ginza",
    nameJp: "Artbar 銀座",
    addressEn: "10th Floor Ginza Crescent Bld\n1 Chome-6-1 Ginza\nChuo City, Tokyo 104-0061",
    addressJp: "〒104-0061 東京都中央区銀座1丁目6-1 銀座クレセントビル 10階",
    accessEn: "Tokyo Metro Ginza-itchome Station: about 1 minute on foot\nJR Yurakucho Station: about 5 minutes on foot\nTokyo Metro Ginza Station: about 5 minutes on foot",
    accessJp: "東京メトロ 銀座一丁目駅から徒歩約1分\nJR 有楽町駅から徒歩約5分\n東京メトロ 銀座駅から徒歩約5分",
    image: GI.locations.ginza,
    mapUrl: "https://maps.app.goo.gl/FiudRj92hBAdPVH37",
    geo: { latitude: 35.6745, longitude: 139.7649 }
  },
  {
    id: "yokohama",
    nameEn: "Artbar Yokohama Motomachi",
    nameJp: "Artbar 横浜元町",
    addressEn: "231-0861 Kanagawa-ken, Yokohama-shi, Naka-ku Motomachi 1-27-2 Enscent Yokohama Motomachi Bld 2nd floor.",
    addressJp: "〒231-0861 神奈川県横浜市中区元町1-27-2 エンセント横濱元町ビル 2F",
    accessEn: "Minatomirai Line Motomachi-Chukagai Station: about 3 minutes on foot\nJR Ishikawacho Station: about 10 minutes on foot",
    accessJp: "みなとみらい線 元町・中華街駅から徒歩約3分\nJR 石川町駅から徒歩約10分",
    image: GI.locations.yokohama,
    mapUrl: "https://maps.app.goo.gl/vWeeAb4QLDYMEayy5",
    geo: { latitude: 35.4422, longitude: 139.6505 }
  },
  {
    id: "osaka_namba",
    nameEn: "Artbar Osaka Namba SkyO",
    nameJp: "Artbar 大阪 なんばスカイオ",
    addressEn: "Namba SkyO 17F, 5-1-60 Namba, Chuo-ku, Osaka-shi, Osaka 542-0076",
    addressJp: "〒542-0076 大阪府大阪市中央区難波5-1-60 なんばスカイオ 17F",
    accessEn: "Directly connected to Nankai Namba Station. Osaka Metro Midosuji Line Namba Station: about 7 minutes on foot.\nAt the 10th-floor lobby, change to the elevator serving the lower office floors and go to the 17th floor. The studio is on the left at the end of the corridor.",
    accessJp: "南海電鉄 なんば駅直結。大阪メトロ御堂筋線 なんば駅から徒歩約7分。\n10階ロビーで低層階用エレベーターに乗り換え、17階へお上がりください。スタジオは廊下突き当たり左手です。",
    image: GI.locations.osaka_namba,
    mapUrl: "https://maps.app.goo.gl/4AqRmV2covWJf2FNA",
    geo: { latitude: 34.6620, longitude: 135.5022 },
    isFranchise: true
  },
  {
    id: "osaka_umeda",
    nameEn: "Artbar Osaka Umeda",
    nameJp: "Artbar 大阪梅田",
    addressEn: "Grand Green Osaka Shops & Restaurants North Building 2F, 6-38 Ofukacho, Kita-ku, Osaka 530-0011",
    addressJp: "〒530-0011 大阪府大阪市北区大深町6-38 グラングリーン大阪 ショップ＆レストラン 北館 2F",
    accessEn: "JR Osaka Station (Central North Exit / Atrium Plaza): about 7 minutes on foot. Follow the 2nd-floor deck through Grand Front Osaka's South and North Buildings, then the connecting bridge to Grand Green Osaka's North Building.\nThe studio is on the 2nd floor, alongside TULLY'S COFFEE / Yurindo.",
    accessJp: "JR 大阪駅 中央北口・アトリウム広場から徒歩約7分。2階連絡デッキでグランフロント大阪の南館・北館を通り、北接続ブリッジでグラングリーン大阪 北館へお越しください。\nスタジオは北館2階、タリーズコーヒー／有隣堂 併設です。",
    image: GI.locations.osaka_umeda,
    mapUrl: "https://maps.app.goo.gl/wkJNcyZoDheU6PkE9",
    geo: { latitude: 34.7068, longitude: 135.4944 },
    isFranchise: true
  },
  {
    id: "osaka_hirakata",
    nameEn: "Artbar Lab Hirakata",
    nameJp: "Artbar Lab 枚方",
    addressEn: "Hirakata Mall 2F, 19-1 Okahigashicho, Hirakata, Osaka 573-0032",
    addressJp: "〒573-0032 大阪府枚方市岡東町19-1 枚方モール 2F",
    accessEn: "Hirakata Mall is directly connected to the East Ticket Gate of Keihan Hirakatashi Station on the 2nd floor.\nThe studio is inside TULLY'S COFFEE on the 2nd floor.",
    accessJp: "京阪電車 枚方市駅 東改札口から枚方モール2階に直結。\nスタジオは2階のタリーズコーヒー内です。",
    image: GI.locations.osaka_hirakata,
    mapUrl: "https://maps.app.goo.gl/ybw2cRaFe4qT3NucA",
    geo: { latitude: 34.8155, longitude: 135.6492 },
    isFranchise: true
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Very fun and relaxing! It completely took my mind off my extremely busy days in Tokyo. Ami, our instructor, was easy to follow, and when I needed help she was right there for me. So much better than the usual Thursday night options!",
    author: "Ryan Stephen Alldridge",
    userImage: GI.testimonials.ryan
  },
  {
    text: "ワインを飲みながらリラックスして、ほろ酔いでキャンバスに描くってこんなに気持ちいんだぁという発見が新鮮でした。何回でも参加したいです。",
    author: "Ritsuko Milliner",
    userImage: GI.testimonials.ritsuko
  },
  {
    text: "At this friendly art studio, the wine is just liquid motivation to let your creative juice flow. You don’t need to be an artist to get stuck in!",
    author: "TimeOut Tokyo",
    role: "Media"
  }
];

export const TEAM_BUILDING_TESTIMONIALS: Testimonial[] = [
  {
    text: "楽しく進めることができました。 スタッフのみなさまが明るく、 的確にガイドしてくださり、絵が苦手と言っていたメンバーもとても楽しんでいました。 業務上はやりとりの少ない同僚ともセッションを通して交流でき、チームの一体感が増したように思います。またチームで力を合わせることで新しいアイデアが生まれたり、より大きな成果に繋がることを実感できた有意義な時間となりました。",
    author: "Amazon Web Services"
  },
  {
    text: "Cathy and her team hosted a wonderful Women’s Wine & Paint night for us at our offices. The event was fantastic for team-building and most of my colleagues who attended (myself included) now proudly have their paintings displayed on their office wall. I highly recommend Cathy and her team if you’re looking for a fun, interesting and collaborative company event.",
    author: "Morrison & Foerster"
  },
  {
    text: "It was really nice to take time out of normal office work/routine. When we painted our own paintings it was really therapeutic and relaxing -it gave me a new energy and motivation to continue with my work for the rest of the week. Doing some activities like this is every once in a while is great for work motivation!",
    author: "Sports Travel & Hospitality Japan"
  },
  {
    text: "The staff was super welcoming and helpful. I felt that everyone was able to bring out their inner artist.",
    author: "Amazon Web Services"
  },
  {
    text: "It was great to learn more about my colleagues in a relaxed environment – don’t have those opportunities in the office.",
    author: "Sports Travel & Hospitality Japan"
  },
  {
    text: "A team work on Art was a very new exercise for me. Very interesting and insightful. Enjoyable with our colleagues and yet appreciate the quality time and even learn a lot about each other through drawings and conversations.",
    author: "Sports Travel & Hospitality Japan"
  },
  {
    text: "We had a blast! The activity itself was very fun and the team had a great time working together, producing a lot of creative ideas. Highly recommended!",
    author: "Go! Go! Nihon"
  }
];

export const MEDIA_LIST: MediaItem[] = [
  {
    outlet: "Hot Pepper Beauty",
    type: "Web",
    logo: "/press/2022-09-hot-pepper-beauty/logo.png",
    image: "/press/2022-09-hot-pepper-beauty/cover.jpg",
  },
  {
    outlet: "SPRiNG Magazine",
    type: "Magazine",
    logo: "/press/2022-06-spring-magazine/logo.jpg",
    image: "/press/2022-06-spring-magazine/cover.jpg",
  },
  {
    outlet: "ぶらり途中下車の旅",
    type: "TV",
    logo: "/press/2022-05-burari-tochuu/logo.jpg",
    image: "/press/2022-05-burari-tochuu/logo.jpg",
  },
  {
    outlet: "Fuji TV",
    type: "TV",
    logo: "/press/2021-06-fuji-tv/logo.png",
    image: "/press/2021-06-fuji-tv/cover.jpg",
    fit: "contain",
  },
  {
    outlet: "J-Wave Radio",
    type: "Radio",
    logo: "/press/2022-01-j-wave-radio/logo.png",
    image: "/press/2022-01-j-wave-radio/cover.jpg",
  },
  {
    outlet: "Vogue Japan",
    type: "Magazine",
    logo: "/press/2020-11-vogue-japan/logo.png",
    image: "/press/2020-11-vogue-japan/cover.jpg",
  },
  {
    outlet: "Ginger",
    type: "Magazine",
    logo: "/press/2020-11-ginger/logo.png",
    image: "/press/2020-11-ginger/cover.jpg",
  },
  {
    outlet: "Tokyo MX",
    type: "TV",
    logo: "/press/2020-08-tokyo-mx/logo.png",
    image: "/press/2020-08-tokyo-mx/cover.jpg",
  },
  {
    outlet: "Aera Magazine",
    type: "Magazine",
    logo: "/press/2020-02-aera-magazine/logo.png",
    image: "/press/2020-02-aera-magazine/cover.jpg",
  },
  {
    outlet: "Timeout Tokyo",
    type: "Web",
    logo: "/press/2019-10-timeout-tokyo/logo.png",
    image: "/press/2019-10-timeout-tokyo/cover.jpg",
  },
  {
    outlet: "The Japan Times",
    type: "Newspaper",
    logo: "/press/2019-10-the-japan-times/logo.png",
    image: "/press/2019-10-the-japan-times/cover.jpg",
  },
  {
    outlet: "BuzzFeed Japan",
    type: "Web",
    logo: "/press/2019-09-buzzfeed-japan/logo.png",
    image: "/press/2019-09-buzzfeed-japan/cover.jpg",
  },
  {
    outlet: "Tokyo Calendar",
    type: "Web",
    logo: "/press/2019-08-tokyo-calendar/logo.png",
    image: "/press/2019-08-tokyo-calendar/cover.jpg",
  },
  {
    outlet: "Harumari Tokyo",
    type: "Web",
    logo: "/press/2019-08-harumari-tokyo/logo.png",
    image: "/press/2019-08-harumari-tokyo/cover.jpg",
  },
  {
    outlet: "2nd Magazine",
    type: "Magazine",
    logo: "/press/2019-05-2nd-magazine/logo.jpg",
    image: "/press/2019-05-2nd-magazine/cover.jpg",
  },
  {
    outlet: "Hanako Magazine",
    type: "Magazine",
    logo: "/press/2018-07-hanako-magazine/logo.jpg",
    image: "/press/2018-07-hanako-magazine/cover.jpg",
  },
  {
    outlet: "Tokyo Weekender",
    type: "Magazine",
    logo: "/press/2016-03-tokyo-weekender/logo.png",
    image: "/press/2016-03-tokyo-weekender/cover.jpg",
  },
];

export const FAQS = [
  {
    question: "When is the schedule for new sessions going to be published on the website?",
    answer: "The next month's schedule will be published from the middle to the end of the month prior. Please check the website regularly and we recommend you check in advance to book your desired sessions."
  },
  {
    question: "Is there a waiting list for cancellations of sold out sessions?",
    answer: "Yes! Artbar has a waitlist system from the event page. People on the waitlist will be notified at once when a seat opens. It is a first come first serve system."
  },
  {
    question: "Can you squeeze in an extra person for a sold out session?",
    answer: "If the session you are booking will be held in Cat Street Harajuku, Ginza, or Yokohama, we may be able to add a slot for you. Please contact us via this online contact form and we can check availability. Due to the size of the studio, we cannot add slots for sessions held in Daikanyama."
  },
  {
    question: "Can I bring my child to an adult session?",
    answer: "We do not allow children to attend the adult sessions as there is free-flow alcohol being served and it is a social setting for adults. Kids can join our weekend art sessions or arrange a private art party with us."
  },
  {
    question: "Can a child under 5 years old join the kids session?",
    answer: "It's no problem for children who are almost turning 5 to join the kids session. Children 4 years old and younger will not be able to join the kids sessions."
  },
  {
    question: "Paint Points QR Code: I received the notification on my phone to retrieve my coupon code. How do I get my coupon code?",
    answer: "Congratulations, and thank you for being such a great customer!\n\n1. After you scan your final QR code, please show your completed card to the instructor.\n2. The instructor will give you a coupon card with your reward on the spot.\n3. Please take a photo of your reward code so you have it for your records.\n\nPlease note: We cannot add points for classes that were not scanned. One card represents one attendee, and only one scan per class is allowed."
  },
  {
    question: "I forgot to scan my points but am eligible for the coupon.",
    answer: "Unfortunately we are not responsible for when the QR code is not scanned during your time at the studio. We are not able to track each person's record and do not have the ability to reset / subtract / add points on your phone for when you scan the next time. Thank you for your understanding and please don’t forget to scan next time!"
  },
  {
    question: "Can I sit in and watch without participating during a session? Can I sit in and watch during my kid's session?",
    answer: "For adult sessions, only participants with purchased tickets can attend the session. For kids sessions, the sessions are for kids only, there are many nearby cafes and restaurants near our where studio you can relax!"
  },
  {
    question: "How can I cancel my session?",
    answer: "To cancel, open your confirmation email and click \"View your booking\" at the bottom. You can then cancel your reservation yourself.\n\nCancellation policies may differ for some classes that require custom orders. Please check your individual class information for specifics.\n\nFor most classes, our cancellation policy is:\nFull refund: Cancel up to 3 days before the event start time.\n25% cancellation fee: Cancel between 3 days and 24 hours before the event start time.\nNo refund: Cancellations within 24 hours of the event start time.\n\nGift certificates are non-refundable."
  }
];

export const FAQS_JP = [
  {
    question: "新しいセッションのスケジュールはいつ公開されますか？",
    answer: "翌月のスケジュールは、前月の中旬から下旬ごろに公開されます。ご希望のセッションを予約しやすいよう、定期的にウェブサイトをご確認いただくことをおすすめします。"
  },
  {
    question: "満席セッションのキャンセル待ちはできますか？",
    answer: "はい！Artbarではイベントページからキャンセル待ち登録ができます。空席が出るとキャンセル待ちの方へ一斉に通知が届き、先着順でご予約いただけます。"
  },
  {
    question: "満席のセッションに1名追加してもらうことはできますか？",
    answer: "キャットストリート原宿、銀座、横浜で開催されるセッションの場合、追加枠をご用意できる場合があります。オンラインお問い合わせフォームよりご連絡ください。スタジオの広さの都合上、代官山で開催されるセッションは追加枠をご用意できません。"
  },
  {
    question: "大人向けセッションに子どもを連れて行けますか？",
    answer: "大人向けセッションではフリーフローのアルコール提供があり、大人の方向けの交流の場として運営しているため、お子様のご参加はご遠慮いただいています。お子様は週末のキッズ向けアートセッション、またはプライベートアートパーティーをご利用ください。"
  },
  {
    question: "5歳未満の子どもはキッズセッションに参加できますか？",
    answer: "もうすぐ5歳になるお子様であれば、キッズセッションにご参加いただけます。4歳以下のお子様はキッズセッションにご参加いただけません。"
  },
  {
    question: "Paint PointsのQRコード通知を受け取りました。クーポンコードはどうすれば受け取れますか？",
    answer: "いつもご利用いただきありがとうございます。\n\n1. 最後のQRコードをスキャンしたら、完成したカードをインストラクターにお見せください。\n2. インストラクターがその場で特典のクーポンカードをお渡しします。\n3. 記録用に、クーポンコードの写真を撮って保管してください。\n\nご注意: スキャンされていないクラス分のポイントを後から追加することはできません。カード1枚につき参加者1名分です。1クラスにつきスキャンは1回のみ有効です。"
  },
  {
    question: "ポイントのQRコードをスキャンし忘れましたが、クーポン対象です。対応できますか？",
    answer: "スタジオご利用時にQRコードをスキャンされなかった場合、こちらで記録を確認したり、スマートフォン上のポイントをリセット・追加・差し引きしたりすることはできません。恐れ入りますが、次回は忘れずにスキャンをお願いいたします。"
  },
  {
    question: "参加せずに見学だけできますか？子どものセッションを見学できますか？",
    answer: "大人向けセッションは、チケットを購入された参加者のみご入場いただけます。キッズセッションはお子様のみで行います。スタジオ周辺にはカフェやレストランがございますので、保護者の方は近隣でお待ちいただけます。"
  },
  {
    question: "セッションをキャンセルするにはどうすればよいですか？",
    answer: "キャンセルするには、予約確認メールの下部にある「View your booking」をクリックしてください。表示された予約ページから、ご自身でキャンセル手続きができます。\n\n特注品や準備が必要なクラスは、キャンセルポリシーが異なる場合があります。詳細は各クラスの案内をご確認ください。\n\n多くのクラスのキャンセルポリシーは以下の通りです。\n全額返金: イベント開始3日前までのキャンセル。\n25%キャンセル料: イベント開始3日前から24時間前までのキャンセル。\n返金不可: イベント開始24時間以内のキャンセル。\n\nギフト券は返金不可です。"
  }
];
