import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
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

    if (
      file.type &&
      file.type !== 'application/octet-stream' &&
      !ALLOWED_MIME_TYPES.includes(file.type)
    ) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 415 });
    }

    const uploadDir = join(process.cwd(), 'public', 'consultation-uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${extension}`;
    const absolutePath = join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(absolutePath, buffer);

    return NextResponse.json(
      {
        url: `/consultation-uploads/${fileName}`,
        name: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[consultation upload POST]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
