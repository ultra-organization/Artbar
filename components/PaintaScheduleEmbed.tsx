'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getTrustedPaintaEmbedOrigin } from '../lib/painta-embed-origin';

const MIN_EMBED_HEIGHT = 200;
const MAX_EMBED_HEIGHT = 800;

interface PaintaScheduleEmbedProps {
  src: string;
  title: string;
  onEmptyChange?: (isEmpty: boolean) => void;
}

export const PaintaScheduleEmbed: React.FC<PaintaScheduleEmbedProps> = ({
  src,
  title,
  onEmptyChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onEmptyChangeRef = useRef(onEmptyChange);
  const [height, setHeight] = useState(420);

  useEffect(() => {
    onEmptyChangeRef.current = onEmptyChange;
  }, [onEmptyChange]);

  useEffect(() => {
    const expectedOrigin = getTrustedPaintaEmbedOrigin(src);
    const handleEmbedMessage = (event: MessageEvent) => {
      if (!expectedOrigin || event.origin !== expectedOrigin || event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (event.data?.type === 'painta:embed:state') {
        if (event.data.state === 'empty') onEmptyChangeRef.current?.(true);
        if (event.data.state === 'ready') onEmptyChangeRef.current?.(false);
        return;
      }

      if (event.data?.type !== 'painta:embed:height') return;

      const reportedHeight = Number(event.data.height);
      if (Number.isFinite(reportedHeight) && reportedHeight > 0) {
        setHeight(
          Math.min(Math.max(Math.ceil(reportedHeight), MIN_EMBED_HEIGHT), MAX_EMBED_HEIGHT),
        );
      }
    };

    window.addEventListener('message', handleEmbedMessage);
    return () => window.removeEventListener('message', handleEmbedMessage);
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      loading="lazy"
      className="block w-full border-0 transition-[height] duration-300 ease-out"
      style={{ height }}
    />
  );
};
