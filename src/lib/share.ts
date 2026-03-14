/**
 * HARMONY Share Utilities
 *
 * Encode/decode compositions for URL-safe sharing via query params.
 */

export interface SharePayload {
  composition: any;
  moment: string;
  title: string;
  emotions: string[];
}

/**
 * Encode a composition + metadata into a URL-safe base64 string.
 */
export function encodeComposition(
  composition: any,
  moment: string,
  title: string,
  emotions: string[],
): string {
  const payload: SharePayload = { composition, moment, title, emotions };
  const json = JSON.stringify(payload);
  // encodeURIComponent handles multi-byte chars before btoa
  return btoa(encodeURIComponent(json));
}

/**
 * Decode a previously-encoded share string back into the payload.
 * Returns null if decoding fails.
 */
export function decodeComposition(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}

/**
 * Generate share text for social / clipboard.
 */
export function generateShareText(title: string, moment: string): string {
  const truncatedMoment =
    moment.length > 100 ? moment.slice(0, 97) + "..." : moment;
  return [
    `"${title}" — composed by HARMONY`,
    ``,
    `"${truncatedMoment}"`,
    ``,
    `Every moment deserves its own music.`,
    `https://harmony.app`,
  ].join("\n");
}
