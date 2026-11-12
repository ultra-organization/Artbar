// Japanese phrase boundaries use JpText’s supported <wbr> markers.
// No prices or offers here: add a holiday deal only once the studio team confirms it.
export const GIFT_CERTIFICATES_URL = 'https://booking.artbar.co.jp/gift-certificates';

export const HOLIDAY_GIFT_COPY = {
  en: {
    stub: 'Artbar Tokyo gift certificate',
    title: 'Give the Gift of Art',
    body: 'Stuck on what to give this year? An Artbar gift certificate lets someone special pick their own paint-and-sip session and take home a canvas they made themselves.',
    cta: 'Shop Gift Certificates',
    ideasLink: 'Gift ideas from our guests',
    image: '/media/blog/holiday-christmas-gifts-tokyo/07-IMG_7785.jpeg',
    imageAlt: 'A guest at Artbar Tokyo holding the portrait she painted of her grandmother',
  },
  jp: {
    stub: 'アートバー東京 ギフト券',
    title: 'アートを、<wbr>贈ろう。',
    body: '今年の贈り物に<wbr>迷ったら、<wbr>アートバーの<wbr>ギフト券は<wbr>いかがですか？<wbr>好きなテーマを<wbr>選んで、<wbr>自分だけの<wbr>一枚を<wbr>描いて<wbr>持ち帰れる<wbr>体験を<wbr>贈れます。',
    cta: 'ギフト券を購入する',
    ideasLink: 'ゲストの<wbr>ギフトアイデアを<wbr>見る',
    image: '/media/blog/holiday-christmas-gifts-tokyo/07-IMG_7785.jpeg',
    imageAlt: 'おばあさまの肖像画を描き上げたアートバー東京のゲスト',
  },
} as const;

export const HOLIDAY_GIFT_BLOG_PATH = '/blog/holiday-christmas-gifts-tokyo';
