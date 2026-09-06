/**
 * Lightweight magic-byte sniffing for video uploads. We can't use `sharp` for
 * videos (it's image-only), so this checks the real binary signature instead
 * of trusting the client-supplied `Content-Type` / filename extension.
 */
export type SniffedVideoType = { mime: string; ext: string } | null;

export function sniffVideoType(buffer: Buffer): SniffedVideoType {
  if (buffer.length < 12) return null;

  // MP4 / MOV / M4V: ISO base media file format — bytes 4-8 spell "ftyp".
  if (buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12).trim().toLowerCase();
    if (brand.startsWith('qt')) return { mime: 'video/quicktime', ext: '.mov' };
    return { mime: 'video/mp4', ext: '.mp4' };
  }

  // WebM / MKV: EBML header.
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { mime: 'video/webm', ext: '.webm' };
  }

  return null;
}
