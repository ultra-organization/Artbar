export type GuideLocale = 'en' | 'jp';

export type GuideCopy = {
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  bestFor: string[];
  sections: {
    title: string;
    body: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  cta: string;
};

export type SeoGuide = {
  slug: string;
  image: string;
  primaryIntent: string;
  primaryIntentJp?: string;
  relatedLinks: {
    href: string;
    labelEn: string;
    labelJp: string;
  }[];
  en: GuideCopy;
  jp: GuideCopy;
};

export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: 'tokyo-rainy-day-date',
    image: '/media/real/couple-date.webp',
    primaryIntent: 'rainy day date Tokyo',
    primaryIntentJp: '東京 雨の日 デート',
    relatedLinks: [
      { href: '/locations', labelEn: 'Tokyo studios', labelJp: '東京のスタジオ' },
      { href: '/themes/japan-inspired', labelEn: 'Japan-inspired paintings', labelJp: '日本モチーフの絵画' },
      { href: '/guides/art-wine-tokyo', labelEn: 'Art and wine guide', labelJp: 'アートとワイン体験' },
    ],
    en: {
      eyebrow: 'Tokyo rainy day date guide',
      title: 'Rainy Day Date Ideas in Tokyo',
      description: 'A practical indoor date guide for Tokyo, with Artbar as a relaxed painting, wine, and creative experience.',
      intro:
        'When Tokyo weather makes outdoor plans harder, Artbar gives couples a warm indoor activity with painting, drinks, and a finished artwork to take home.',
      bestFor: ['Rainy day dates', 'Couples visiting Tokyo', 'Indoor plans', 'Creative evenings'],
      sections: [
        {
          title: 'An indoor plan for a rainy day',
          body: 'Stay out of the rain and enjoy painting together at Artbar. An artist guides the session, so you can join even if you have never painted before.',
        },
        {
          title: 'What makes Artbar date-friendly',
          body: 'The session gives couples something to do together, keeps conversation easy, and creates a shared keepsake instead of another standard dinner or bar plan.',
        },
        {
          title: 'How to choose a studio',
          body: 'Daikanyama, Harajuku, Ginza, and Yokohama locations help customers pick the easiest indoor plan based on where they are spending the day.',
        },
      ],
      faqs: [
        {
          question: 'Is Artbar good for a rainy day in Tokyo?',
          answer: 'Yes. It is an indoor guided painting experience with drinks, so it works well when outdoor plans are less comfortable.',
        },
        {
          question: 'Is this suitable for a first date?',
          answer: 'Yes. The guided format gives both people something natural to focus on, even if they have never painted before.',
        },
      ],
      cta: 'Find a rainy day session',
    },
    jp: {
      eyebrow: '東京の雨の日デート',
      title: '東京の雨の日デートにおすすめのアート体験',
      description: '東京で雨の日にも楽しめる屋内デートを探している方へ。絵画体験、ドリンク、思い出づくりを組み合わせたArtbarガイドです。',
      intro:
        '雨の日の東京デートでは、屋内で過ごせて、会話が生まれ、思い出にも残る体験が選ばれやすくなります。Artbarは、絵を描きながらドリンクを楽しめるデート向けのアート体験です。',
      bestFor: ['雨の日デート', '屋内デート', 'カップル', 'いつもと違う東京のお出かけ'],
      sections: [
        {
          title: 'なぜ「雨の日デート」と相性がいい？',
          body: '雨の日は、屋内で絵とドリンクを楽しむデートに。講師がサポートするので、絵を描くのが初めての方も参加できます。',
        },
        {
          title: '食事やカフェだけではないデートに',
          body: '絵を描く体験があることで、自然に会話が生まれます。完成した作品を持ち帰れるので、ただ過ごすだけではなく思い出として残る時間になります。',
        },
        {
          title: '東京エリアで選びやすいスタジオ',
          body: '代官山、原宿、銀座、横浜などのスタジオから、その日の予定やアクセスに合わせて選べます。',
        },
      ],
      faqs: [
        {
          question: '雨の日でも参加しやすいですか？',
          answer: 'はい。屋内のガイド付き絵画体験なので、天気に左右されにくいデートプランとして使いやすいです。',
        },
        {
          question: '初デートにも向いていますか？',
          answer: 'はい。絵を描く流れがあるので会話のきっかけが作りやすく、初心者でも参加できます。',
        },
      ],
      cta: '雨の日に参加できるセッションを見る',
    },
  },
  {
    slug: 'tokyo-art-experience',
    image: '/media/guides/tokyo-art-classes.jpg',
    primaryIntent: 'Tokyo art experience',
    primaryIntentJp: '東京 アート体験 / 絵画 体験 東京',
    relatedLinks: [
      { href: '/themes/van-gogh', labelEn: 'Van Gogh paintings', labelJp: 'ゴッホテーマ' },
      { href: '/themes/paint-pouring', labelEn: 'Paint pouring', labelJp: 'ポーリングアート' },
      { href: '/locations', labelEn: 'Tokyo locations', labelJp: '東京のスタジオ' },
    ],
    en: {
      eyebrow: 'Tokyo art experience guide',
      title: 'Tokyo Art Experiences for Beginners',
      description: 'A guide to casual Tokyo art experiences and beginner-friendly painting sessions at Artbar.',
      intro:
        'Artbar is built for people who want a creative Tokyo activity without joining a formal art school or bringing their own materials.',
      bestFor: ['First-time painters', 'Travelers', 'Friends', 'Creative dates'],
      sections: [
        {
          title: 'A casual art experience, not a formal course',
          body: 'Choose a painting you like and join a guided session. Your materials are included, and an artist helps you create your own piece.',
        },
        {
          title: 'Painting experience in Tokyo',
          body: 'Spend time painting with friends, a partner, or on your own. Browse the themes and studio locations to find a session that suits your plans.',
        },
        {
          title: 'Choose by theme',
          body: 'Guests can choose familiar artists, Japan-inspired subjects, abstract techniques, pet portraits, and seasonal classes.',
        },
      ],
      faqs: [
        {
          question: 'Can beginners join?',
          answer: 'Yes. Artbar sessions include materials and instructor guidance for beginners.',
        },
        {
          question: 'Is this good for travelers?',
          answer: 'Yes. It gives visitors a creative Tokyo memory and a finished artwork to take home.',
        },
      ],
      cta: 'Explore art experiences',
    },
    jp: {
      eyebrow: '東京のアート体験',
      title: '東京で楽しむアート体験・絵画体験',
      description: '東京でアート体験や絵画体験を探している方へ。初心者でも参加しやすいArtbar Tokyoの体験ガイドです。',
      intro:
        'Artbarは、本格的な美術教室に通う前提ではなく、気軽に絵を描いて作品を完成させたい人のためのアート体験です。',
      bestFor: ['初めて絵を描く方', '東京観光中の方', '友人とのお出かけ', 'クリエイティブなデート'],
      sections: [
        {
          title: '気軽に参加できるアート体験',
          body: '好きな絵を選んで、手ぶらで参加できます。画材は用意されており、講師のサポートを受けながら自分だけの作品を描きます。',
        },
        {
          title: '東京で気軽に絵を描く時間',
          body: '友人やパートナーと、またはお一人で、絵を描く時間を楽しみませんか。テーマやスタジオから、ご予定に合うセッションを探せます。',
        },
        {
          title: 'テーマを選んで楽しめる',
          body: '有名アーティスト、日本モチーフ、抽象技法、ペット肖像画、季節テーマなど、目的や気分に合わせて選べます。',
        },
      ],
      faqs: [
        {
          question: '初心者でも参加できますか？',
          answer: 'はい。画材とインストラクターの案内があるので、初めての方でも参加できます。',
        },
        {
          question: '東京観光の予定にも入れやすいですか？',
          answer: 'はい。屋内で楽しめて、完成した作品を持ち帰れるため、東京の思い出作りにも向いています。',
        },
      ],
      cta: 'アート体験を探す',
    },
  },
  {
    slug: 'tokyo-art-workshop',
    image: '/media/real/group-team.webp',
    primaryIntent: 'Tokyo art workshop',
    primaryIntentJp: '東京 ワークショップ / 東京 アートワークショップ',
    relatedLinks: [
      { href: '/team-building', labelEn: 'Team building', labelJp: 'チームビルディング' },
      { href: '/private-parties', labelEn: 'Private parties', labelJp: '貸切イベント' },
      { href: '/guides/tokyo-art-experience', labelEn: 'Art experience guide', labelJp: 'アート体験ガイド' },
    ],
    en: {
      eyebrow: 'Tokyo workshop guide',
      title: 'Art Workshops in Tokyo',
      description: 'A guide to Artbar Tokyo art workshops for groups, beginners, team events, and social creative plans.',
      intro:
        'Try a painting workshop in Tokyo with an artist to guide you. Come with friends or join on your own. Beginners are welcome.',
      bestFor: ['Friend groups', 'Corporate teams', 'Private events', 'Beginner workshops'],
      sections: [
        {
          title: 'What to expect at an art workshop',
          body: 'Choose your theme, studio, and date. Artbar provides the painting materials and guides you through the session.',
        },
        {
          title: 'For individuals and groups',
          body: 'Scheduled sessions work for smaller groups, while private parties and team-building events work for companies and larger groups.',
        },
        {
          title: 'A workshop with a finished result',
          body: 'Guests leave with their own painting, which makes the workshop easier to understand and more memorable than a passive activity.',
        },
      ],
      faqs: [
        {
          question: 'Is Artbar a workshop?',
          answer: 'Yes. Artbar sessions are guided art workshops with painting materials and instructor support.',
        },
        {
          question: 'Can companies book a workshop?',
          answer: 'Yes. Companies can use the team-building or private event options for group planning.',
        },
      ],
      cta: 'Find a workshop',
    },
    jp: {
      eyebrow: '東京のアートワークショップ',
      title: '東京のアートワークショップ',
      description: '東京でワークショップを探している方へ。初心者、友人グループ、企業イベントにも使いやすいArtbarのアートワークショップガイドです。',
      intro:
        '東京で、講師と一緒に絵を描くワークショップを楽しみませんか。友人と一緒でも、お一人でも、初めての方を歓迎します。',
      bestFor: ['友人グループ', '企業イベント', '貸切イベント', '初心者向けワークショップ'],
      sections: [
        {
          title: 'アートワークショップの楽しみ方',
          body: 'テーマ、スタジオ、日程を選んで参加できます。画材はArtbarが用意し、講師がセッションを通してサポートします。',
        },
        {
          title: '少人数にもグループにも対応',
          body: '通常セッションは友人同士やカップルに使いやすく、貸切やチームビルディングは会社や大人数のイベントに向いています。',
        },
        {
          title: '作品を持ち帰れるワークショップ',
          body: '体験だけで終わらず、自分で描いた作品を持ち帰れるため、記憶に残りやすいワークショップになります。',
        },
      ],
      faqs: [
        {
          question: 'Artbarはワークショップとして参加できますか？',
          answer: 'はい。画材とインストラクターの案内がある、初心者向けのアートワークショップとして参加できます。',
        },
        {
          question: '会社イベントでも使えますか？',
          answer: 'はい。チームビルディングや貸切イベントとして相談できます。',
        },
      ],
      cta: 'ワークショップを探す',
    },
  },
  {
    slug: 'paint-and-sip-tokyo',
    image: '/media/guides/paint-and-sip-tokyo.jpg',
    primaryIntent: 'paint and sip Tokyo',
    primaryIntentJp: '東京 アート体験',
    relatedLinks: [
      { href: '/locations', labelEn: 'Tokyo locations', labelJp: '東京のスタジオ' },
      { href: '/themes/japan-inspired', labelEn: 'Japan-inspired paintings', labelJp: '日本モチーフの絵画' },
      { href: '/team-building', labelEn: 'Team building', labelJp: 'チームビルディング' },
    ],
    en: {
      eyebrow: 'Tokyo paint and sip guide',
      title: 'Paint and Sip in Tokyo',
      description: 'A practical guide to Artbar Tokyo paint and sip classes, locations, drinks, themes, and booking.',
      intro:
        'Artbar Tokyo is a beginner-friendly paint and sip studio where guests paint with step-by-step guidance while enjoying wine or soft drinks.',
      bestFor: ['Date nights', 'Friends visiting Tokyo', 'Birthday plans', 'Creative evenings after work'],
      sections: [
        {
          title: 'What happens in a paint and sip class?',
          body: 'Guests choose a scheduled painting session, arrive at the studio, receive materials, and follow an instructor-led painting experience. The mood is social and relaxed, so beginners can enjoy the class without needing art experience.',
        },
        {
          title: 'Where can I book Artbar in Tokyo?',
          body: 'Artbar has Tokyo-area studios including Daikanyama, Harajuku, Ginza, and Yokohama. Location pages now show address and transit details so visitors can choose the easiest studio before booking.',
        },
        {
          title: 'Which painting theme should I choose?',
          body: 'Popular options include Japan-inspired paintings, Van Gogh, Monet, paint pouring, alcohol ink, texture art, paint your pet, and private custom sessions.',
        },
      ],
      faqs: [
        {
          question: 'Do I need painting experience?',
          answer: 'No. Artbar sessions are designed for beginners and include instructor guidance and materials.',
        },
        {
          question: 'Are drinks included?',
          answer: 'Artbar experiences are built around painting with drinks, with wine and non-alcoholic options depending on the session.',
        },
        {
          question: 'Can English speakers join?',
          answer: 'Yes. Artbar is a bilingual studio experience for Tokyo locals, international residents, and travelers.',
        },
      ],
      cta: 'View the Artbar schedule',
    },
    jp: {
      eyebrow: '東京ペイント＆シップガイド',
      title: '東京で楽しむペイント＆シップ',
      description: 'Artbar Tokyoのペイント＆シップ体験、スタジオ、ドリンク、テーマ、予約方法をまとめたガイドです。',
      intro:
        'Artbar Tokyoは、ワインやソフトドリンクを楽しみながら絵を描ける、初心者歓迎のペイント＆シップスタジオです。',
      bestFor: ['デート', '友人とのお出かけ', '誕生日', '仕事帰りのクリエイティブな時間'],
      sections: [
        {
          title: 'ペイント＆シップでは何をする？',
          body: 'スケジュールから好きな絵を選び、スタジオで画材を受け取り、インストラクターの案内に沿って作品を仕上げます。初心者でも参加しやすい、リラックスした体験です。',
        },
        {
          title: '東京エリアのスタジオ',
          body: '代官山、原宿、銀座、横浜などのスタジオがあります。各ロケーションページで住所やアクセスを確認してから予約できます。',
        },
        {
          title: 'どんなテーマがある？',
          body: '日本モチーフ、ゴッホ、モネ、ポーリングアート、アルコールインク、テクスチャーアート、ペットを描こう、プライベートイベントなどがあります。',
        },
      ],
      faqs: [
        {
          question: '絵の経験がなくても大丈夫？',
          answer: 'はい。Artbarのセッションは初心者向けで、インストラクターの案内と画材が含まれます。',
        },
        {
          question: 'ドリンクはありますか？',
          answer: 'ワインやソフトドリンクを楽しみながら絵を描ける体験です。内容はセッションにより異なります。',
        },
        {
          question: '英語でも参加できますか？',
          answer: 'はい。Artbarは日本語・英語に対応したバイリンガルなアート体験です。',
        },
      ],
      cta: 'スケジュールを見る',
    },
  },
  {
    slug: 'art-wine-tokyo',
    image: '/media/guides/art-wine-tokyo.jpg',
    primaryIntent: 'art wine Tokyo',
    primaryIntentJp: '東京 アート体験',
    relatedLinks: [
      { href: '/themes/paint-pouring', labelEn: 'Paint pouring', labelJp: 'ポーリングアート' },
      { href: '/locations/ginza', labelEn: 'Ginza studio', labelJp: '銀座スタジオ' },
      { href: '/private-parties', labelEn: 'Private parties', labelJp: 'プライベートイベント' },
    ],
    en: {
      eyebrow: 'Wine and art in Tokyo',
      title: 'Art and Wine Experiences in Tokyo',
      description: 'Find a relaxed Tokyo art and wine experience for dates, friends, visitors, and private celebrations.',
      intro:
        'Enjoy painting and a drink in a relaxed studio at Artbar. It is a chance to spend time together and make something of your own in Tokyo.',
      bestFor: ['Evening plans', 'Couples', 'Small groups', 'Visitors who want a Tokyo memory'],
      sections: [
        {
          title: 'Why art and wine works for groups',
          body: 'The painting gives everyone something to do, while the drink setting keeps the event relaxed. Guests leave with a finished artwork, so the experience has a built-in keepsake.',
        },
        {
          title: 'A calmer alternative to a bar',
          body: 'For customers looking beyond dinner or drinks, an Artbar session adds a creative activity without requiring formal art training.',
        },
        {
          title: 'Private art and wine events',
          body: 'Private parties and company sessions can use the same paint-and-sip format with a group-friendly setup and custom planning.',
        },
      ],
      faqs: [
        {
          question: 'Is Artbar more like a class or a bar?',
          answer: 'It is a guided painting class with a relaxed drink-friendly studio atmosphere.',
        },
        {
          question: 'Can I book for a group?',
          answer: 'Yes. Groups can book scheduled sessions, and larger or custom groups can use private party or team-building options.',
        },
      ],
      cta: 'Book an art and wine session',
    },
    jp: {
      eyebrow: '東京のアートとワイン',
      title: '東京で楽しむアートとワイン体験',
      description: 'デート、友人とのお出かけ、旅行中の思い出、貸切イベントに使いやすい東京のアートとワイン体験ガイドです。',
      intro:
        'Artbarは、絵を描く体験とドリンクを組み合わせた、東京で楽しめるクリエイティブなお出かけ先です。',
      bestFor: ['夜のお出かけ', 'カップル', '少人数グループ', '東京らしい思い出作り'],
      sections: [
        {
          title: 'グループに向いている理由',
          body: '絵を描くという共通の体験があるので会話が生まれやすく、完成した作品を持ち帰れるのも魅力です。',
        },
        {
          title: 'バーだけではない過ごし方',
          body: '食事や飲み会以外の選択肢として、アート体験を加えることで、より記憶に残る時間になります。',
        },
        {
          title: '貸切イベントにも対応',
          body: 'プライベートパーティーや企業イベントでは、ペイント＆シップ形式をグループ向けにカスタムできます。',
        },
      ],
      faqs: [
        {
          question: 'Artbarは教室ですか？バーですか？',
          answer: 'インストラクター付きのアート体験に、ドリンクを楽しめるスタジオの雰囲気を組み合わせた場所です。',
        },
        {
          question: 'グループ予約はできますか？',
          answer: 'はい。通常セッションへの参加に加え、貸切やチームビルディングの相談もできます。',
        },
      ],
      cta: 'アートとワイン体験を予約する',
    },
  },
  {
    slug: 'tokyo-art-classes',
    image: '/media/guides/tokyo-art-classes.jpg',
    primaryIntent: 'Tokyo art classes',
    primaryIntentJp: '絵画 体験 東京',
    relatedLinks: [
      { href: '/instructors', labelEn: 'Meet instructors', labelJp: 'インストラクター' },
      { href: '/themes/van-gogh', labelEn: 'Van Gogh theme', labelJp: 'ゴッホテーマ' },
      { href: '/themes/monet', labelEn: 'Monet theme', labelJp: 'モネテーマ' },
    ],
    en: {
      eyebrow: 'Beginner art class guide',
      title: 'Beginner-Friendly Art Classes in Tokyo',
      description: 'A guide for people looking for casual, bilingual, beginner-friendly art classes in Tokyo.',
      intro:
        'Artbar is built for people who want a creative class without committing to a formal art school. Sessions are guided, social, and easy to join.',
      bestFor: ['First-time painters', 'English speakers in Tokyo', 'Tourists', 'Casual creative hobbies'],
      sections: [
        {
          title: 'Casual instead of academic',
          body: 'A scheduled Artbar session focuses on finishing a piece and enjoying the process. It is different from a long-term technical art course.',
        },
        {
          title: 'Bilingual studio experience',
          body: 'The site and studio experience support English and Japanese, which helps travelers and international residents understand what to expect before booking.',
        },
        {
          title: 'Choose by subject or mood',
          body: 'Customers can choose themes such as famous artists, Japan-inspired paintings, abstract techniques, pets, portraits, and seasonal classes.',
        },
      ],
      faqs: [
        {
          question: 'Is this a serious art course?',
          answer: 'No. It is a casual guided art experience designed to be fun, approachable, and social.',
        },
        {
          question: 'Can tourists join?',
          answer: 'Yes. Artbar is suitable for Tokyo visitors who want a creative local activity.',
        },
      ],
      cta: 'Find an art class',
    },
    jp: {
      eyebrow: '初心者向けアートクラス',
      title: '東京の初心者向けアートクラス',
      description: '東京で気軽に参加できる、初心者歓迎・バイリンガル対応のアートクラスガイドです。',
      intro:
        'Artbarは、本格的な美術学校ではなく、気軽に作品づくりを楽しみたい人向けのアート体験です。',
      bestFor: ['初めて絵を描く方', '英語対応を探している方', '旅行者', '気軽な趣味'],
      sections: [
        {
          title: '本格講座ではなく、気軽な体験',
          body: 'Artbarのセッションは、作品を完成させる楽しさとリラックスした時間を大切にしています。',
        },
        {
          title: '日本語・英語に対応',
          body: 'サイトとスタジオ体験は日本語・英語に対応しており、海外からのゲストにもわかりやすい構成です。',
        },
        {
          title: 'テーマで選べる',
          body: '有名アーティスト、日本モチーフ、抽象画、ペット、ポートレート、季節テーマなどから選べます。',
        },
      ],
      faqs: [
        {
          question: '本格的な美術講座ですか？',
          answer: 'いいえ。楽しく、参加しやすく、交流しやすいカジュアルなアート体験です。',
        },
        {
          question: '旅行者でも参加できますか？',
          answer: 'はい。東京旅行中のクリエイティブな体験としても参加できます。',
        },
      ],
      cta: 'アートクラスを探す',
    },
  },
  {
    slug: 'private-paint-and-sip-tokyo',
    image: '/media/guides/private-paint-and-sip-tokyo.jpg',
    primaryIntent: 'private paint and sip Tokyo',
    primaryIntentJp: '東京 貸切 アート体験',
    relatedLinks: [
      { href: '/private-parties', labelEn: 'Private parties', labelJp: 'プライベートパーティー' },
      { href: '/team-building', labelEn: 'Corporate team building', labelJp: '企業イベント' },
      { href: '/contact', labelEn: 'Contact Artbar', labelJp: 'お問い合わせ' },
    ],
    en: {
      eyebrow: 'Private group guide',
      title: 'Private Paint and Sip Events in Tokyo',
      description: 'Plan a private paint and sip event in Tokyo for birthdays, company events, bachelorettes, families, and groups.',
      intro:
        'Private Artbar events give groups a hosted creative experience with painting, drinks, and a clear activity everyone can join.',
      bestFor: ['Birthdays', 'Corporate groups', 'Bachelorettes', 'Family gatherings'],
      sections: [
        {
          title: 'Why private events convert well',
          body: 'A private paint and sip event solves a common group problem: people want something structured, social, and easy for mixed skill levels.',
        },
        {
          title: 'Corporate and team events',
          body: 'For companies, the painting format works as a low-pressure team activity that is easier to join than performance-based entertainment.',
        },
        {
          title: 'Custom planning',
          body: 'Customers can start from the private parties or team-building pages, then contact Artbar for group details and planning.',
        },
      ],
      faqs: [
        {
          question: 'Can Artbar host private groups?',
          answer: 'Yes. Artbar has private party and team-building options for groups that need a more tailored setup.',
        },
        {
          question: 'Is this suitable for beginners?',
          answer: 'Yes. The format is designed so mixed-experience groups can participate together.',
        },
      ],
      cta: 'Plan a private event',
    },
    jp: {
      eyebrow: '貸切グループガイド',
      title: '東京の貸切ペイント＆シップイベント',
      description: '誕生日、企業イベント、女子会、家族イベントなどに使える東京の貸切ペイント＆シップガイドです。',
      intro:
        'Artbarの貸切イベントは、絵を描く体験、ドリンク、参加しやすい進行を組み合わせたグループ向けの時間です。',
      bestFor: ['誕生日', '企業イベント', '女子会', '家族イベント'],
      sections: [
        {
          title: '貸切イベントに向いている理由',
          body: 'グループで何をするか迷う場面で、ペイント＆シップは進行があり、会話も生まれやすい体験です。',
        },
        {
          title: '企業・チーム向け',
          body: '会社イベントでは、経験差があっても参加しやすい、プレッシャーの少ないチームアクティビティになります。',
        },
        {
          title: '相談しながら企画できる',
          body: 'プライベートパーティーやチームビルディングページから、人数や内容に合わせて相談できます。',
        },
      ],
      faqs: [
        {
          question: '貸切グループに対応していますか？',
          answer: 'はい。プライベートパーティーやチームビルディング向けの相談ができます。',
        },
        {
          question: '初心者が多くても大丈夫？',
          answer: 'はい。経験差があるグループでも参加しやすい形式です。',
        },
      ],
      cta: '貸切イベントを相談する',
    },
  },
  {
    slug: 'paint-your-pet-tokyo',
    image: '/media/guides/paint-your-pet-tokyo.jpg',
    primaryIntent: 'paint your pet Tokyo',
    primaryIntentJp: 'ペット 似顔絵 東京',
    relatedLinks: [
      { href: '/paint-your-pet', labelEn: 'Paint Your Pet page', labelJp: 'ペットを描こう' },
      { href: '/themes/paint-your-pet', labelEn: 'Pet portrait theme', labelJp: 'ペット肖像画テーマ' },
      { href: '/blog/holiday-christmas-gifts-tokyo', labelEn: 'Creative gift ideas', labelJp: '手作りギフトのアイデア' },
    ],
    en: {
      eyebrow: 'Pet portrait guide',
      title: 'Paint Your Pet in Tokyo',
      description: 'A guide to Artbar Tokyo pet portrait painting sessions for dog, cat, and animal lovers.',
      intro:
        'Create a painting of your pet at Artbar Tokyo. Keep it as a memory of your animal companion or give it to someone who loves them.',
      bestFor: ['Pet owners', 'Gift givers', 'Couples', 'Friends who want a keepsake'],
      sections: [
        {
          title: 'Make a portrait of your pet',
          body: 'Paint your dog, cat, or another animal you love with help from an artist. Check the class details for photo requirements and preparation before you book.',
        },
        {
          title: 'A strong gift angle',
          body: 'Pet paintings work for birthdays, holidays, anniversaries, memorial keepsakes, and surprise gifts.',
        },
        {
          title: 'Find your pet painting session',
          body: 'Visit Paint Your Pet for class details, or open the pet portrait theme to see upcoming sessions.',
        },
      ],
      faqs: [
        {
          question: 'Can I paint my dog or cat?',
          answer: 'Yes. Paint Your Pet sessions are made for guests who want to create a pet portrait keepsake.',
        },
        {
          question: 'Is this a good gift?',
          answer: 'Yes. A custom pet painting can work as a personal gift or shared experience.',
        },
      ],
      cta: 'Explore Paint Your Pet',
    },
    jp: {
      eyebrow: 'ペット肖像画ガイド',
      title: '東京でペットを描くアート体験',
      description: '犬、猫、大切な動物をキャンバスに残したい方へ。Artbar Tokyoのペット肖像画体験ガイドです。',
      intro:
        'Artbar Tokyoで、大切なペットの絵を描きませんか。ご自宅に飾る思い出の一枚にも、ペットを愛する方への贈り物にもぴったりです。',
      bestFor: ['ペットオーナー', 'ギフトを探している方', 'カップル', '思い出を残したい友人同士'],
      sections: [
        {
          title: '大切なペットを一枚の絵に',
          body: '講師のサポートを受けながら、犬や猫など大切な動物を描きます。写真の用意や事前準備については、ご予約前にクラスの詳細をご確認ください。',
        },
        {
          title: 'ギフトにも強い',
          body: '誕生日、ホリデー、記念日、メモリアル、サプライズギフトとして使いやすい体験です。',
        },
        {
          title: 'ペットを描くセッションを探す',
          body: '「ペットを描こう」ページで参加方法を確認し、ペット肖像画のテーマページから開催予定のセッションをご覧ください。',
        },
      ],
      faqs: [
        {
          question: '犬や猫を描けますか？',
          answer: 'はい。大切なペットをキャンバスに残したい方に向けた体験です。',
        },
        {
          question: 'ギフトにも向いていますか？',
          answer: 'はい。パーソナルなギフトや、一緒に楽しむ体験としても向いています。',
        },
      ],
      cta: 'ペットを描こうを見る',
    },
  },
];

export const SEO_GUIDE_SLUGS = SEO_GUIDES.map((guide) => guide.slug);

export function guidePath(slug: string) {
  return `/guides/${slug}`;
}

export function getGuideBySlug(slug: string) {
  return SEO_GUIDES.find((guide) => guide.slug === slug);
}

export function guideCopy(guide: SeoGuide, lang: GuideLocale) {
  return guide[lang];
}

export function guidePrimaryIntent(guide: SeoGuide, lang: GuideLocale) {
  return lang === 'jp' ? guide.primaryIntentJp ?? guide.primaryIntent : guide.primaryIntent;
}
