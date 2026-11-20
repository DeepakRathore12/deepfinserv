export const LOGO_MAX_BYTES = 200 * 1024;
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/**
 * The image type from the file's own bytes, never from the client's Content-Type. SVG is refused
 * because it can carry script.
 */
export function sniffImage(b: Buffer): (typeof LOGO_TYPES)[number] | null {
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP')
    return 'image/webp';
  return null;
}

/** Path under the API base. The version changes with each upload, so the image can be cached forever. */
export const logoPath = (id: string, updatedAt: Date | string | null): string | null =>
  updatedAt ? `/lenders/${id}/logo?v=${new Date(updatedAt).getTime()}` : null;
