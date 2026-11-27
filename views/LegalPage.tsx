import type { LegalPageContent } from '@/data/legal-content';
import { JpText } from '../components/JpText';
import type { SiteLanguage } from '@/lib/language';

type LegalPageProps = {
  page: LegalPageContent;
  lang: SiteLanguage;
};

export function LegalPage({ page, lang }: LegalPageProps) {
  const sections = [...page.sections].sort((a, b) => {
    const preferred = lang === 'en' ? 'English' : '日本語';
    if (a.language === preferred) return -1;
    if (b.language === preferred) return 1;
    return 0;
  });
  const primarySection = sections[0];

  const jp = lang === 'jp';

  return (
    <div className="relative min-h-screen bg-artbar-bg pb-24 pt-32 text-artbar-navy md:pb-32 md:pt-44">
      <div className="mx-auto w-full max-w-[1100px] px-7 sm:px-8 md:px-12">
        <header className="border-b border-artbar-navy/15 pb-10 md:pb-14">
          <p className="flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
            <span className="h-px w-10 bg-current" aria-hidden />Artbar Tokyo
          </p>
          <h1 className={`mt-5 ${jp ? 'text-[clamp(1.8rem,7vw,3rem)] font-semibold leading-[1.4] tracking-[0.04em]' : 'font-heading text-[clamp(2.4rem,8vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.02em]'}`}>
            <JpText>{primarySection?.eyebrow ?? page.title}</JpText>
          </h1>
          <p className="mt-4 text-[15px] text-artbar-gray md:text-lg"><JpText>{page.title}</JpText></p>
          {page.updated ? (
            <p className="mt-5 text-[13px] tracking-[0.04em] text-artbar-taupe">発効日 / Effective date: {page.updated}</p>
          ) : null}
        </header>

        <div className="mt-12 space-y-10 md:mt-16 md:space-y-14">
          {sections.map((section) => {
            const sectionJp = section.language === '日本語';
            return (
              <section
                key={`${page.slug}-${section.language}`}
                className="relative bg-white px-6 py-9 sm:px-8 md:px-14 md:py-14"
                lang={sectionJp ? 'ja' : 'en'}
              >
                <div className="pointer-events-none absolute inset-2.5 border border-artbar-taupe/25 md:inset-3" aria-hidden />
                <div className="relative mb-9 flex flex-col gap-4 border-b border-artbar-navy/10 pb-7 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe"><JpText>{section.eyebrow}</JpText></p>
                    <h2 className={`mt-3 ${sectionJp ? 'text-[clamp(1.35rem,5vw,1.9rem)] font-semibold leading-[1.5] tracking-[0.04em]' : 'font-heading text-[clamp(1.7rem,5.5vw,2.4rem)] font-semibold leading-[1.1]'}`}>
                      <JpText>{section.title}</JpText>
                    </h2>
                  </div>
                  <span className="w-fit border-b border-artbar-navy/25 pb-0.5 text-[13px] font-semibold tracking-[0.06em]">
                    <JpText>{section.language}</JpText>
                  </span>
                </div>

                {section.intro ? (
                  <p className="relative mb-9 max-w-[70ch] text-[15px] leading-[2] md:text-[17px]"><JpText>{section.intro}</JpText></p>
                ) : null}

                <div className="relative space-y-9">
                  {section.blocks.map((block, index) => (
                    <div key={`${section.language}-${block.heading ?? 'fields'}-${index}`}>
                      {block.heading ? (
                        <h3 className={`mb-3 ${sectionJp ? 'text-[17px] font-semibold leading-[1.6] tracking-[0.03em]' : 'font-heading text-xl font-semibold'}`}>
                          <JpText>{block.heading}</JpText>
                        </h3>
                      ) : null}

                      {block.body?.map((paragraph) => (
                        <p key={paragraph} className="mb-3 max-w-[70ch] text-[14px] leading-[2] text-artbar-gray md:text-[15px]">
                          <JpText>{paragraph}</JpText>
                        </p>
                      ))}

                      {block.list ? (
                        <ul className="mt-4 max-w-[70ch] space-y-3 text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]">
                          {block.list.map((item) => (
                            <li key={item} className="flex gap-4">
                              <span className="mt-[0.95em] h-px w-3 flex-none bg-artbar-taupe" aria-hidden />
                              <span><JpText>{item}</JpText></span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {block.fields ? (
                        <dl className="border-t border-artbar-navy/15">
                          {block.fields.map((field) => (
                            <div key={field.label} className="grid gap-1.5 border-b border-artbar-navy/10 py-4 md:grid-cols-[220px_1fr] md:gap-8">
                              <dt className="text-[13px] font-semibold tracking-[0.04em] text-artbar-navy">
                                <JpText>{field.label}</JpText>
                              </dt>
                              <dd className="text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]"><JpText>{field.value}</JpText></dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
