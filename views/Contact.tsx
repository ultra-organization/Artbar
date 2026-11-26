'use client';

import React, { useState } from 'react';
import { ArrowDown, Plus, Send } from 'lucide-react';
import { Hairline, PILL_NAVY, WRAP } from '../components/premium/Kit';
import { DecoSplat, Magnetic, PAINT } from '../components/premium/Paint';
import { useContent } from '../context/ContentContext';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';

export const Contact: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    company: '', // honeypot — must stay empty
  });
  const { site, lang, localizedCopy } = useContent();

  const updateField = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMessage(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error ?? null);
        setStatus('err');
        return;
      }
      setStatus('ok');
      setForm({ subject: '', name: '', email: '', phone: '', message: '', company: '' });
    } catch {
      setStatus('err');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const contactCopy = localizedCopy.ui.contact;
  const subjects = contactCopy.subjectOptions.map((item) => ({
    value: item.value,
    label: stripJpSentinel(item.label),
  }));
  const faqs = localizedCopy.faqs;
  const sendingLabels = {
    en: 'Sending…',
    jp: '送信中…',
  } as const;

  const copy = {
    subjectLabel: contactCopy.subjectLabel,
    nameLabel: contactCopy.nameLabel,
    namePlaceholder: stripJpSentinel(contactCopy.namePlaceholder),
    emailLabel: contactCopy.emailLabel,
    emailPlaceholder: stripJpSentinel(contactCopy.emailPlaceholder),
    phoneLabel: contactCopy.phoneLabel,
    messageLabel: contactCopy.messageLabel,
    messagePh: stripJpSentinel(contactCopy.messagePlaceholder),
    send: contactCopy.send,
    sent: contactCopy.sent,
    failed: contactCopy.failed,
  };

  const jp = lang === 'jp';
  const labelClass = 'block text-[12px] font-medium tracking-[0.14em] text-artbar-taupe';
  const fieldClass = 'mt-2 w-full border-0 border-b border-artbar-navy/20 bg-transparent px-0 py-3 text-[16px] text-artbar-navy outline-none transition-colors placeholder:text-artbar-gray/50 focus:border-artbar-navy focus:ring-0';

  return (
    <div className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44">
        <DecoSplat seed={9} color={PAINT.lightTaupe} className="-right-24 top-16 h-72 w-72 md:right-[8%] md:h-96 md:w-96" opacity={0.5} />
        <div className={`${WRAP} relative`}>
          {stripJpSentinel(site.contactPage.badge).trim() && (
            <p className="hp-in flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]"><span className="h-px w-10 bg-current" aria-hidden /><JpText>{site.contactPage.badge}</JpText></p>
          )}
          <h1 className={`hp-in mt-5 max-w-4xl ${jp ? 'text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.35] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`} style={{ animationDelay: '100ms' }}>
            <JpText>{site.contactPage.title}</JpText>
          </h1>
          {stripJpSentinel(site.contactPage.notice2).trim() && (
            <p className="hp-in mt-6 max-w-2xl border-l-2 border-artbar-taupe pl-5 text-[15px] font-medium leading-[1.9] md:text-base" style={{ animationDelay: '200ms' }}>
              <JpText>{site.contactPage.notice2}</JpText>
            </p>
          )}
          <div className="hp-in mt-9 flex flex-wrap gap-x-8 gap-y-3" style={{ animationDelay: '300ms' }}>
            {[{ href: '#contact-form', label: jp ? 'メッセージを送る' : 'Send a message' }, { href: '#contact-faqs', label: jp ? 'よくある質問' : 'Read FAQs' }].map((l) => (
              <a key={l.href} href={l.href} className="group inline-flex min-h-11 items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-[15px] font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy">
                {l.label}
                <ArrowDown size={15} className="transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className={`${WRAP} grid gap-20 lg:grid-cols-12 lg:gap-16`}>
        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="contact-faqs" className="scroll-mt-28 lg:col-span-6">
          <h2 className={`${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[28px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}><JpText>{site.contactPage.faqTitle}</JpText></h2>
          <div className="mt-8 border-t border-artbar-navy/15">
            {faqs.map((faq, index) => {
              const open = openIndex === index;
              return (
                <div key={index} className="border-b border-artbar-navy/10">
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-navy md:py-6"
                  >
                    <span className={`text-[15px] font-semibold leading-[1.7] transition-colors md:text-base ${open ? 'text-artbar-navy' : 'text-artbar-navy/80'}`}>
                      <JpText>{faq.question}</JpText>
                    </span>
                    <Plus size={20} className={`shrink-0 text-artbar-taupe transition-transform duration-300 ${open ? 'rotate-45' : ''}`} aria-hidden />
                  </button>
                  <div id={`faq-answer-${index}`} hidden={!open} className="pb-6 pr-10">
                    <p className="whitespace-pre-line text-[15px] leading-[1.95] text-artbar-gray"><JpText>{faq.answer}</JpText></p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Form on a mounted sheet ───────────────────────────────────── */}
        <section id="contact-form" tabIndex={-1} className="scroll-mt-28 lg:col-span-6">
          <div className="relative bg-white p-7 shadow-[0_40px_80px_-50px_rgba(5,55,97,0.45)] md:p-12 lg:sticky lg:top-28">
            <Hairline tone="taupe" className="inset-2.5 md:inset-3.5" />
            <div className="relative">
              <h2 className={`${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[28px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}><JpText>{site.contactPage.formTitle}</JpText></h2>
              {status === 'ok' && (
                <p role="status" className="mt-6 border-l-2 border-artbar-taupe pl-4 text-[15px]"><JpText>{copy.sent}</JpText></p>
              )}
              {status === 'err' && (
                <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[15px] text-red-700">
                  {errorMessage ? errorMessage : <JpText>{copy.failed}</JpText>}
                </p>
              )}
              <form className="mt-8 space-y-8" onSubmit={handleSubmit} noValidate>
                {/* Honeypot — hidden from real users; bots fill it. */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={updateField('company')} />
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}><JpText>{copy.subjectLabel}</JpText></label>
                  <select id="subject" name="subject" className={`${fieldClass} cursor-pointer appearance-none`} required value={form.subject} onChange={updateField('subject')}>
                    {subjects.map((s, i) => (
                      <option key={s.value || 'placeholder'} value={s.value} disabled={i === 0 && s.value === ''}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}><JpText>{copy.nameLabel}</JpText></label>
                    <input type="text" id="name" name="name" className={fieldClass} placeholder={copy.namePlaceholder} required value={form.name} onChange={updateField('name')} />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}><JpText>{copy.emailLabel}</JpText></label>
                    <input type="email" id="email" name="email" className={fieldClass} placeholder={copy.emailPlaceholder} required value={form.email} onChange={updateField('email')} />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}><JpText>{copy.phoneLabel}</JpText></label>
                  <input type="tel" id="phone" name="phone" className={fieldClass} placeholder="090-1234-5678" required value={form.phone} onChange={updateField('phone')} />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}><JpText>{copy.messageLabel}</JpText></label>
                  <textarea id="message" name="message" rows={5} className={`${fieldClass} resize-none`} placeholder={copy.messagePh} value={form.message} onChange={updateField('message')} />
                </div>

                <div className="pt-2">
                  <Magnetic className="w-full sm:w-auto">
                    <button type="submit" disabled={status === 'sending'} className={`${PILL_NAVY} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}>
                      <JpText>{status === 'sending' ? sendingLabels[lang] : copy.send}</JpText>
                      <Send size={17} aria-hidden />
                    </button>
                  </Magnetic>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
