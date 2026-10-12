/**
 * Upload type check by content, not by the MIME type the browser claims. Only the four types the
 * Fastify server accepted are allowed, and the bytes must agree with the declared type.
 */
export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export function sniff(bytes: Uint8Array): string | null {
  const b = (i: number) => bytes[i];
  if (bytes.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b(i) === v)
  )
    return 'image/png';
  if (
    bytes.length >= 12 &&
    String.fromCharCode(b(0), b(1), b(2), b(3)) === 'RIFF' &&
    String.fromCharCode(b(8), b(9), b(10), b(11)) === 'WEBP'
  )
    return 'image/webp';
  if (bytes.length >= 5 && String.fromCharCode(b(0), b(1), b(2), b(3), b(4)) === '%PDF-')
    return 'application/pdf';
  return null;
}
