import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { postImages } from '@/lib/schema';
import { uploadBuffer, publicUrlFor } from '@/lib/storage';
import { sniffVideoType } from '@/lib/file-validation';
import { requireAuth } from '@/lib/require-auth';

export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
  gif: '.gif',
  avif: '.avif',
};

// Used only as a hint for which validation branch to take — the actual
// content is always verified from the file's real bytes below, never trusted
// from the client-supplied MIME type or filename.
const DECLARED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

export async function POST(req: NextRequest) {
  // Only admins upload rich content into posts via the editor.
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const looksLikeVideo =
      DECLARED_VIDEO_TYPES.includes(file.type) || /\.(mp4|webm|mov|mkv)$/i.test(file.name);

    if (looksLikeVideo) {
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'File exceeds 100 MB limit' }, { status: 413 });
      }
      const sniffed = sniffVideoType(buffer);
      if (!sniffed) {
        return NextResponse.json({ error: 'Invalid or unsupported video file' }, { status: 415 });
      }

      const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${sniffed.ext}`;
      const objectKey = `content/${filename}`;
      await uploadBuffer(objectKey, buffer, sniffed.mime);
      await db.insert(postImages).values({ filename, path: objectKey, size: file.size });

      return NextResponse.json({ url: publicUrlFor(objectKey), type: 'video' }, { status: 201 });
    }

    // Image path: re-decode + re-encode with sharp. This both verifies the
    // bytes are really a valid image (defeats MIME/extension spoofing) and
    // strips any embedded metadata/payloads from the original file.
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 8 MB limit' }, { status: 413 });
    }

    let format: string | undefined;
    let outputBuffer: Buffer;
    try {
      const image = sharp(buffer, { failOn: 'error' });
      const metadata = await image.metadata();
      format = metadata.format;
      if (!format || !(format in IMAGE_MIME_TO_EXT)) {
        throw new Error(`Unsupported image format: ${format}`);
      }
      outputBuffer = Buffer.from(await image.toBuffer());
    } catch (err) {
      console.error('[upload] image validation failed', err);
      return NextResponse.json({ error: 'Invalid image file' }, { status: 415 });
    }

    const ext = IMAGE_MIME_TO_EXT[format];
    const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    const objectKey = `content/${filename}`;
    await uploadBuffer(objectKey, outputBuffer, `image/${format}`);
    await db.insert(postImages).values({ filename, path: objectKey, size: outputBuffer.length });

    return NextResponse.json({ url: publicUrlFor(objectKey), type: 'image' }, { status: 201 });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
