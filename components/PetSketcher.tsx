'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Download,
  Loader2,
  Mail,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { Button } from './ui/Button';
import { JpText } from './JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { ARTBAR_TOKYO_EMAIL } from '../constants';
import { useContent } from '../context/ContentContext';

type HandoffState = 'idle' | 'packaging' | 'ready';

export const PetSketcher: React.FC = () => {
  const { localizedCopy } = useContent();
  const copy = localizedCopy.ui.paintYourPet;
  const text = (_fallback: string, localized: string) => localized;
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [handoffState, setHandoffState] = useState<HandoffState>('idle');
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classLocation, setClassLocation] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetHandoffState = () => {
    setHandoffState('idle');
    setHandoffMessage(null);
  };

  const sanitizeForFileName = (value: string) =>
    value
      .trim()
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || text('guest', copy.defaultStudentName);

  const formatClassDateForDisplay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const buildReferenceCode = () => {
    const datePart = classDate || text('date-tbd', copy.dateTbd);
    const studentPart = sanitizeForFileName(studentName);
    const petPart = sanitizeForFileName(petName);
    return `PYP-${datePart}-${studentPart}-${petPart}`.toUpperCase();
  };

  const getDownloadDetails = () => {
    const mimeMatch = generatedImage?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = mimeMatch?.[1] || 'image/png';
    const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';
    const referenceCode = buildReferenceCode();

    return {
      fileName: `${referenceCode}-artbar-pet-sketch.${extension}`,
      summaryFileName: `${referenceCode}-artbar-class-details.txt`,
      mimeType,
      referenceCode,
    };
  };

  const buildEmailSubject = () => {
    const dateLabel = classDate || text('DATE-TBD', copy.dateTbd);
    return `[PaintYourPet][${dateLabel}][${studentName.trim() || text('Guest', copy.defaultStudentName)}][${petName.trim() || text('Pet', copy.defaultPetName)}][${buildReferenceCode()}]`;
  };

  const buildClassSummary = () => {
    const dateLabel = formatClassDateForDisplay(classDate) || text('Not provided', copy.notProvided);
    const locationLabel = classLocation.trim() || text('Not provided', copy.notProvided);
    const notesLabel = bookingNotes.trim() || text('None', copy.none);
    const { referenceCode, fileName } = getDownloadDetails();

    return `${text('Paint Your Pet class handoff', copy.classSummaryTitle)}
${text('Reference', copy.classSummaryReference)}: ${referenceCode}
${text('Student name', copy.classSummaryStudentName)}: ${studentName.trim()}
${text('Student email', copy.classSummaryStudentEmail)}: ${studentEmail.trim()}
${text('Pet name', copy.classSummaryPetName)}: ${petName.trim()}
${text('Class date', copy.classSummaryClassDate)}: ${dateLabel}
${text('Studio/location', copy.classSummaryLocation)}: ${locationLabel}
${text('Notes', copy.classSummaryNotes)}: ${notesLabel}
${text('Sketch file', copy.classSummarySketchFile)}: ${fileName}
${text('Destination inbox', copy.classSummaryDestinationInbox)}: ${ARTBAR_TOKYO_EMAIL}`;
  };

  const validateHandoffFields = () => {
    if (!generatedImage) return text('Please generate a sketch first.', copy.invalidNeedSketch);
    if (!studentName.trim()) return text('Please add the student name.', copy.invalidStudentName);
    if (!studentEmail.trim()) return text('Please add the student email.', copy.invalidStudentEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      return text('Please add a valid student email.', copy.invalidStudentEmailFormat);
    }
    if (!petName.trim()) return text('Please add the pet name.', copy.invalidPetName);
    if (!classDate.trim()) return text('Please add the class date.', copy.invalidClassDate);
    return null;
  };

  const downloadTextFile = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadImageFile = () => {
    if (!generatedImage) return;
    const { fileName } = getDownloadDetails();
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const copyReference = async () => {
    const code = buildReferenceCode();
    try {
      await navigator.clipboard.writeText(code);
      setHandoffMessage(`${text('Reference copied', copy.referenceCopiedPrefix)}: ${code}`);
    } catch (error) {
      console.error('Reference copy failed', error);
      setHandoffMessage(`${text('Reference', copy.referencePrefix)}: ${code}`);
    }
  };

  const openPrefilledEmail = () => {
    const body = `${text('Hi Artbar team,', copy.emailGreeting)}

${text("I'd like to use this sketch for my Paint Your Pet class.", copy.emailIntro)}

${buildClassSummary()}

${text('I have attached the sketch file.', copy.emailAttached)}

${text('Thank you!', copy.emailThanks)}`;

    const mailto = `mailto:${ARTBAR_TOKYO_EMAIL}?subject=${encodeURIComponent(buildEmailSubject())}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const prepareEmailPackage = async (message?: string) => {
    const summary = buildClassSummary();
    const { summaryFileName } = getDownloadDetails();

    downloadImageFile();
    downloadTextFile(summary, summaryFileName);
    openPrefilledEmail();

    setHandoffState('ready');
    setHandoffMessage(
      message ||
        text('Your sketch package is ready. We saved the sketch, saved the class details file, and opened a ready-to-send email to Artbar Tokyo.', copy.packageReady)
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setErrorMessage(null);
    setUploadNote(null);
    resetHandoffState();

    if (!file.type.startsWith('image/')) {
      setErrorMessage(text('Please upload a photo file such as JPG or PNG.', copy.uploadInvalidType));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(text('That photo is too large. Please choose one under 15MB.', copy.uploadTooLarge));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage(text('We could not read that photo. Please try a JPG or PNG image.', copy.uploadReadError));
    };
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        setErrorMessage(text('We could not read that photo. Please try a different image.', copy.uploadDifferentImage));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        setErrorMessage(text('This photo format is not decoding cleanly here. Please try a JPG or PNG version.', copy.uploadDecodeError));
      };
      img.onload = () => {
        const MAX_SIZE = 1536;
        let width = img.width;
        let height = img.height;

        if (!width || !height) {
          setErrorMessage(text('That photo looks invalid. Please try a different image.', copy.uploadInvalidImage));
          return;
        }

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setErrorMessage(text('Your browser could not prepare this image. Please try again.', copy.browserPrepareError));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImage(jpegDataUrl);
        setGeneratedImage(null);
        setUploadNote(
          file.type === 'image/jpeg'
            ? text('Photo ready.', copy.photoReady)
            : text('Photo converted for smoother sketch generation.', copy.photoConverted)
        );
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const generateSketch = async () => {
    if (!image) return;
    setLoading(true);
    setErrorMessage(null);
    resetHandoffState();
    try {
      const base64Data = image.split(',')[1];
      const controller = new AbortController();
      // Keep the browser timeout slightly longer than the server timeout so the friendlier server message can win.
      const timeout = window.setTimeout(() => controller.abort(), 50000);

      const res = await fetch('/api/generate-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || copy.sketchCreateError);
      }
      if (!payload?.imageBase64 || !payload?.mimeType) {
        throw new Error(text('The sketch came back incomplete. Please try again.', copy.sketchIncomplete));
      }

      setGeneratedImage(`data:${payload.mimeType};base64,${payload.imageBase64}`);
    } catch (error) {
      console.error('Sketch generation failed', error);
      const message =
        error instanceof Error && error.name === 'AbortError'
          ? text('The sketch took too long. Please try again with a simpler or smaller photo.', copy.sketchTimeout)
          : error instanceof Error
            ? error.message
            : text('Something went wrong. Please try again.', copy.genericError);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const submitForClass = async () => {
    const validationError = validateHandoffFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!generatedImage) return;

    setErrorMessage(null);
    setHandoffState('packaging');
    setHandoffMessage(text('Preparing your sketch package...', copy.preparingMessage));
    await prepareEmailPackage();
  };

  const prepareValidatedEmailPackage = async () => {
    const validationError = validateHandoffFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    await prepareEmailPackage();
  };

  return (
    <div className="relative mx-auto max-w-5xl bg-artbar-bg px-6 py-10 sm:px-8 md:p-14">
      <div className="pointer-events-none absolute inset-2.5 border border-artbar-taupe/30 md:inset-3" aria-hidden />
      <div className="relative mb-10 md:mb-12">
        <h2 className="flex items-center gap-3 text-[clamp(1.4rem,5.4vw,2rem)] font-semibold leading-[1.45] tracking-[0.03em] text-artbar-navy">
          <Sparkles className="shrink-0 text-artbar-taupe" size={24} /> <JpText>{text('Magic Sketch Preview', copy.sketchTitle)}</JpText>
        </h2>
        <p className="mt-4 max-w-xl text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]">
          <JpText>{text('Upload a photo of your pet to see how our AI envisions a simple canvas sketch.', copy.sketchIntro)}</JpText>
        </p>
      </div>

      <div className="relative grid items-start gap-10 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              min-h-[16rem] border border-dashed bg-white flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
              ${image ? 'border-artbar-taupe' : 'border-artbar-navy/25 hover:border-artbar-taupe'}
            `}
          >
            {image ? (
	              <img
	                src={image}
	                alt={text('Original Pet', stripJpSentinel(copy.originalPetAlt))}
	                className="block h-auto w-full max-h-[min(70vh,560px)] object-contain"
	              />
            ) : (
              <div className="text-center p-6 text-artbar-taupe group-hover:text-artbar-navy transition-colors">
	                <Upload size={36} strokeWidth={1.5} className="mx-auto mb-4" />
	                <p className="text-sm font-semibold tracking-[0.06em]">{text('Click to Upload Photo', copy.uploadCta)}</p>
	                <p className="text-xs mt-2 opacity-60">{text('JPG, PNG, HEIC, AVIF', copy.uploadFormats)}</p>
	              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
	              aria-label={text('Upload pet photo', stripJpSentinel(copy.uploadAriaLabel))}
              onChange={handleFileUpload}
            />
          </div>

          <Button
            onClick={generateSketch}
            disabled={!image || loading}
            className="min-h-14 w-full rounded-full border-none bg-artbar-navy py-4 text-white hover:bg-artbar-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
	            {loading ? (
	              <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> {text('Sketching...', copy.sketching)}</span>
	            ) : (
	              <span className="flex items-center gap-2"><Sparkles size={18} /> {text('Generate Line Art', copy.generateLineArt)}</span>
	            )}
          </Button>

          {uploadNote && (
            <p className="border-l-2 border-artbar-taupe bg-white px-4 py-3 text-sm text-green-800">
              {uploadNote}
            </p>
          )}
          {errorMessage && (
            <p className="border-l-2 border-red-400 bg-white px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative flex min-h-[16rem] items-center justify-center overflow-hidden border border-artbar-navy/10 bg-white">
            {generatedImage ? (
	              <img
	                src={generatedImage}
	                alt={text('AI Sketch', stripJpSentinel(copy.aiSketchAlt))}
	                className="block h-auto w-full max-h-[min(70vh,560px)] object-contain"
	              />
            ) : (
              <div className="px-6 py-12 text-center text-artbar-taupe/70">
	                <ImageIcon size={36} strokeWidth={1.5} className="mx-auto mb-4" />
	                <p className="text-xs font-semibold tracking-[0.08em]">{text('Sketch will appear here', copy.sketchPlaceholder)}</p>
	              </div>
            )}
          </div>

          {generatedImage && (
            <div className="flex flex-col gap-5">
              <a
                href={generatedImage}
                download={getDownloadDetails().fileName}
                className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full border-2 border-artbar-navy bg-white px-4 text-sm font-heading font-bold tracking-wide text-artbar-navy transition-all hover:bg-gray-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-artbar-navy focus:ring-offset-2"
              >
	                <Download size={16} className="shrink-0" aria-hidden />
	                {text('Save sketch', copy.saveSketch)}
	              </a>

              <div className="bg-white text-artbar-navy p-4 border-l-2 border-artbar-taupe text-sm flex items-start gap-3">
	                <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
	                <div>
	                  <strong><JpText>{text('Like this version?', copy.likeThisVersionTitle)}</JpText></strong> <JpText>{text('Send it to Artbar with your class details so the team can match it to the right student and class day.', copy.likeThisVersionBody)}</JpText>
	                </div>
              </div>

              <div className="border-t border-artbar-navy/15 pt-6 space-y-4">
                <div>
	                  <h3 className="font-heading font-heavy text-artbar-navy text-lg mb-2">
	                    <JpText>{text('Use this sketch for your Paint Your Pet class', copy.classUseTitle)}</JpText>
	                  </h3>
	                  <p className="text-sm text-artbar-gray leading-relaxed">
	                    <JpText>{text('Fill in the class details below, then press the main button. We will package the sketch with a clear reference, save the files, and open an email to Artbar so it is easy for you to send.', copy.classUseBody)}</JpText>
	                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="pet-sketch-student-name" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Student name', copy.studentNameLabel)}
                    </label>
                    <input
                      id="pet-sketch-student-name"
                      type="text"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        resetHandoffState();
                      }}
	                      placeholder={text('e.g. Alex Tanaka', stripJpSentinel(copy.studentNamePlaceholder))}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy placeholder:text-gray-400 focus:border-artbar-navy focus:outline-none"
                      autoComplete="name"
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="pet-sketch-student-email" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Student email', copy.studentEmailLabel)}
                    </label>
                    <input
                      id="pet-sketch-student-email"
                      type="email"
                      value={studentEmail}
                      onChange={(e) => {
                        setStudentEmail(e.target.value);
                        resetHandoffState();
                      }}
	                      placeholder={text('e.g. alex@example.com', stripJpSentinel(copy.studentEmailPlaceholder))}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy placeholder:text-gray-400 focus:border-artbar-navy focus:outline-none"
                      autoComplete="email"
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="pet-sketch-pet-name" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Pet name', copy.petNameLabel)}
                    </label>
                    <input
                      id="pet-sketch-pet-name"
                      type="text"
                      value={petName}
                      onChange={(e) => {
                        setPetName(e.target.value);
                        resetHandoffState();
                      }}
	                      placeholder={text('e.g. Luna', stripJpSentinel(copy.petNamePlaceholder))}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy placeholder:text-gray-400 focus:border-artbar-navy focus:outline-none"
                      autoComplete="off"
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="pet-sketch-class-date" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Class date', copy.classDateLabel)}
                    </label>
                    <input
                      id="pet-sketch-class-date"
                      type="date"
                      value={classDate}
                      onChange={(e) => {
                        setClassDate(e.target.value);
                        resetHandoffState();
                      }}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy focus:border-artbar-navy focus:outline-none"
                    />
                  </div>

                  <div className="min-w-0 sm:col-span-2">
                    <label htmlFor="pet-sketch-location" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Studio or location', copy.locationLabel)} <span className="font-normal normal-case">({text('optional', copy.optionalLabel)})</span>
                    </label>
                    <input
                      id="pet-sketch-location"
                      type="text"
                      value={classLocation}
                      onChange={(e) => {
                        setClassLocation(e.target.value);
                        resetHandoffState();
                      }}
	                      placeholder={text('e.g. Ginza', stripJpSentinel(copy.locationPlaceholder))}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy placeholder:text-gray-400 focus:border-artbar-navy focus:outline-none"
                      autoComplete="off"
                    />
                  </div>

                  <div className="min-w-0 sm:col-span-2">
                    <label htmlFor="pet-sketch-notes" className="mb-1 block text-xs font-bold uppercase tracking-wide text-artbar-gray">
	                      {text('Notes for Artbar', copy.notesLabel)} <span className="font-normal normal-case">({text('optional', copy.optionalLabel)})</span>
                    </label>
                    <textarea
                      id="pet-sketch-notes"
                      value={bookingNotes}
                      onChange={(e) => {
                        setBookingNotes(e.target.value);
                        resetHandoffState();
                      }}
	                      placeholder={text('e.g. Booking under a different name, two pets, special note', stripJpSentinel(copy.notesPlaceholder))}
                      rows={3}
                      className="w-full border-0 border-b border-artbar-navy/25 bg-transparent px-0 py-2.5 text-sm text-artbar-navy placeholder:text-gray-400 focus:border-artbar-navy focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="border border-artbar-navy/10 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-artbar-taupe">
	                        {text('Searchable reference', copy.referenceLabel)}
                      </p>
                      <p className="mt-1 text-sm font-heading font-bold text-artbar-navy break-all">
                        {buildReferenceCode()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyReference()}
                      className="inline-flex items-center gap-2 rounded-full border border-artbar-navy/15 px-3 py-1.5 text-xs font-semibold text-artbar-navy hover:bg-artbar-bg"
                    >
	                      <Copy size={14} />
	                      {text('Copy', copy.copyReference)}
	                    </button>
                  </div>
                  <p className="mt-2 text-xs text-artbar-gray leading-relaxed">
	                    <JpText>{text('This same reference is used in the file name, the email subject, and the handoff notes so the team can find the right student fast.', copy.referenceHelp)}</JpText>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void submitForClass()}
                  disabled={handoffState === 'packaging'}
                  className="h-12 w-full gap-2 border-2 border-artbar-navy px-4 py-0 text-sm font-heading font-bold text-artbar-navy hover:bg-white"
                >
                  {handoffState === 'packaging' ? (
                    <>
	                      <Loader2 size={16} className="animate-spin shrink-0" aria-hidden />
	                      {text('Preparing your package...', copy.preparingPackage)}
                    </>
                  ) : (
                    <>
	                      <Mail size={16} className="shrink-0" aria-hidden />
	                      {text('Yes, use this for my class', copy.useForClass)}
                    </>
                  )}
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-artbar-navy/15 bg-white px-4 text-sm font-semibold text-artbar-navy hover:bg-gray-50"
                    onClick={() => void prepareValidatedEmailPackage()}
                  >
	                    <Download size={16} className="shrink-0" aria-hidden />
	                    {text('Prepare email package', copy.prepareEmailPackage)}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-artbar-navy/15 bg-white px-4 text-sm font-semibold text-artbar-navy hover:bg-gray-50"
                    onClick={() => {
	                      downloadTextFile(buildClassSummary(), getDownloadDetails().summaryFileName);
	                      setHandoffMessage(text('Class details saved as a text file for backup.', copy.classDetailsSaved));
                    }}
                  >
	                    <CheckCircle2 size={16} className="shrink-0" aria-hidden />
	                    {text('Save class details', copy.saveClassDetails)}
                  </button>
                </div>

                {handoffMessage && (
                  <p
                    className={`rounded-xl px-4 py-3 text-sm ${
                      handoffState === 'ready'
                        ? 'border border-green-200 bg-green-50 text-green-800'
                        : 'border border-artbar-navy/10 bg-white text-artbar-navy'
                    }`}
                  >
                    {handoffMessage}
                  </p>
                )}
              </div>

              <p className="text-center text-xs text-gray-500">
	                <JpText>{text('This package is prepared for you to send from your own email. We save the sketch, save the class details, and open a ready-made email to {email}.', copy.packageFooter).replace('{email}', ARTBAR_TOKYO_EMAIL)}</JpText>
              </p>

              <button
                type="button"
                className="w-full text-center text-xs font-medium text-artbar-taupe underline underline-offset-2 hover:text-artbar-navy"
                onClick={() => {
                  setImage(null);
                  setGeneratedImage(null);
                  setErrorMessage(null);
                  setUploadNote(null);
                  setStudentName('');
                  setStudentEmail('');
                  setPetName('');
                  setClassDate('');
                  setClassLocation('');
                  setBookingNotes('');
                  resetHandoffState();
                }}
              >
	                {text('Clear and start over', copy.clearAndStartOver)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
