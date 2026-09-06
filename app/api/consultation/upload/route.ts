import { randomBytes } from 'crypto';
import { extname } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadBuffer, publicUrlFor } from '@/lib/storage';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.doc', '.docx'];

function sniffDocumentType(buffer: Buffer, ext: string): { mime: string } | null {
  if (buffer.length < 4) return null;

  // PDF: "%PDF-"
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { mime: 'application/pdf' };
  }
  // Legacy .doc (OLE Compound File): D0 CF 11 E0 A1 B1 1A E1
  if (buffer.subarray(0, 4).toString('hex') === 'd0cf11e0') {
    return { mime: 'application/msword' };
  }
  // .docx is a ZIP archive: "PK\x03\x04"
  if (buffer.subarray(0, 4).toString('hex') === '504b0304' && ext === '.docx') {
    return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }
  // JPEG handled separately via sharp below.
  return null;
}

export async function POST(req: NextRequest) {
  // 10 uploads / 10 minutes per IP — a legitimate consultation request has at most 5 files.
  const { allowed } = rateLimit(`consultation-upload:${getClientIp(req)}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'تعداد آپلودها زیاد است. کمی بعد دوباره تلاش کنید.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 413 });
    }

    const extension = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: 'File extension not allowed' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let mime: string;
    let outputBuffer = buffer;

    if (extension === '.jpg' || extension === '.jpeg') {
      try {
        const image = sharp(buffer, { failOn: 'error' });
        const metadata = await image.metadata();
        if (metadata.format !== 'jpeg') throw new Error('not a jpeg');
        outputBuffer = Buffer.from(await image.toBuffer());
        mime = 'image/jpeg';
      } catch {
        return NextResponse.json({ error: 'Invalid image file' }, { status: 415 });
      }
    } else {
      const sniffed = sniffDocumentType(buffer, extension);
      if (!sniffed) {
        return NextResponse.json({ error: 'Invalid or unrecognized file content' }, { status: 415 });
      }
      mime = sniffed.mime;
    }

    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${extension}`;
    const objectKey = `consultation/${fileName}`;
    await uploadBuffer(objectKey, outputBuffer, mime);

    return NextResponse.json(
      {
        url: publicUrlFor(objectKey),
        name: file.name,
        size: outputBuffer.length,
        type: mime,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[consultation upload POST]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
