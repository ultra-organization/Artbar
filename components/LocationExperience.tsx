import Image from 'next/image';

// Photos already approved and published on Artbar's home/theme pages.
// These are regional examples, not evidence of a class at the current studio.
const TOKYO_PHOTOS = [
  {
    src: '/media/published/home.features.3/f48d6e5f-6404-4b46-880a-d63ebe369fa6/display.webp',
    altEn: 'Guests painting at an Artbar class',
    altJp: 'Artbarのクラスで絵を描く参加者',
    captionEn: 'A class in progress at Artbar',
    captionJp: 'Artbarのクラス風景',
    position: 'center 45%',
  },
  {
    src: '/media/published/home.popularthemes.monet/b642752b-f765-45e9-a57b-55db7bbaa3bb/display.webp',
    altEn: 'A finished Monet-inspired water lily painting on an easel',
    altJp: 'イーゼルに飾られたモネの睡蓮をモチーフにした完成作品',
    captionEn: 'A finished painting from Artbar’s theme gallery',
    captionJp: 'Artbarのテーマギャラリーから、完成作品の一例',
    position: 'center',
  },
];

const OSAKA_PHOTOS = [
  {
    src: '/media/location-experience/osaka-class.webp',
    altEn: 'Guests creating paint-pouring art at an Artbar class',
    altJp: 'Artbarのクラスでたらし込みアートを制作する参加者',
    captionEn: 'A paint-pouring class at Artbar',
    captionJp: 'Artbarのたらし込みアートのクラス風景',
    position: 'center',
  },
  {
    src: '/media/location-experience/osaka-painting.webp',
    altEn: 'A finished Mount Fuji painting on an easel',
    altJp: 'イーゼルに飾られた富士山の完成作品',
    captionEn: 'A finished painting from Artbar’s theme gallery',
    captionJp: 'Artbarのテーマギャラリーから、完成作品の一例',
    position: 'center',
  },
];

export function LocationExperience({ locationId, lang }: { locationId: string; lang: 'en' | 'jp' }) {
  const isOsaka = locationId.startsWith('osaka_');
  const isJp = lang === 'jp';
  const photos = isOsaka ? OSAKA_PHOTOS : TOKYO_PHOTOS;
  const region = isOsaka ? (isJp ? '大阪' : 'Osaka') : (isJp ? '東京・横浜' : 'Tokyo and Yokohama');

  return (
    <section aria-labelledby="first-artbar-class" className="mx-auto mt-16 max-w-[1180px] px-6 md:mt-20 md:px-10">
      <div className="grid gap-6 border-t border-artbar-navy/15 pt-10 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:pt-12">
        <h2 id="first-artbar-class" className="max-w-sm font-heading text-3xl font-bold leading-tight text-artbar-navy md:text-4xl">
          {isJp ? 'はじめてでも、気軽にアート体験。' : 'Your first Artbar class'}
        </h2>
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-artbar-navy/80">
          <p>
            {isJp
              ? `${region}で楽しむ、Artbarのアート体験。絵を描くのが久しぶりの方も、初めての方も、講師のサポートを受けながら自分らしい一枚を描けます。画材とエプロンをご用意しているので、気軽にご参加ください。`
              : `Artbar brings relaxed, guided art experiences to ${region}. Whether you are picking up a brush for the first time or returning to painting, an instructor helps you create a piece of your own. Art materials and an apron are provided.`}
          </p>
          <p>
            {isJp
              ? '好きな作品や日程からクラスを選んでご予約ください。料金・所要時間・対象年齢・ドリンクなどの提供内容はクラスによって異なります。作品のお持ち帰りや乾燥・配送のご案内も、各クラスの詳細をご確認ください。'
              : 'Choose a class by its artwork and date. Check the individual listing for the price, duration, ages, drinks and other inclusions, plus any drying, collection or delivery arrangements for your artwork.'}
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-10 md:gap-8">
        {photos.map((photo) => (
          <figure key={photo.src} className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white">
              <Image
                src={photo.src}
                alt={isJp ? photo.altJp : photo.altEn}
                fill
                loading="lazy"
                sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1179px) 45vw, 534px"
                className="object-cover"
                style={{ objectPosition: photo.position }}
              />
            </div>
            <figcaption className="mt-3 text-sm leading-relaxed text-artbar-navy/80">
              {isJp ? photo.captionJp : photo.captionEn}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-artbar-navy/70">
        {isJp
          ? '上の2枚はArtbarのクラス・作品の共通イメージです。スタジオや開催テーマによって雰囲気・内容は異なります。このスタジオの開催内容は下のクラス一覧でご確認ください。'
          : 'Class and artwork photos are shared examples from Artbar. Studio settings and themes vary; see the class list below for what is available here.'}
      </p>
    </section>
  );
}
