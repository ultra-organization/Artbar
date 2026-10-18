import { PAINTA_EMBED_ORIGIN } from '../constants';

/** Limit iframe state/resize messages to the configured Painta host or Artbar booking hosts. */
export function getTrustedPaintaEmbedOrigin(src: string): string | null {
  try {
    const origin = new URL(src).origin;
    const configuredOrigin = new URL(PAINTA_EMBED_ORIGIN).origin;
    return [configuredOrigin, 'https://booking.artbar.co.jp', 'https://tickets.artbar.co.jp'].includes(origin)
      ? origin
      : null;
  } catch {
    return null;
  }
}
