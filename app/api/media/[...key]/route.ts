import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { getObjectStream, statObject } from '@/lib/storage';

export const runtime = 'nodejs';

type Params = { params: Promise<{ key: string[] }> };

/**
 * Proxies uploaded files out of MinIO so the bucket itself never needs to be
 * public and MinIO's host/credentials are never exposed to the browser.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { key } = await params;
  const objectKey = key.join('/');

  // Defense in depth against path traversal, even though MinIO object keys
  // are not filesystem paths.
  if (objectKey.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const stat = await statObject(objectKey);
    const stream = await getObjectStream(objectKey);
    const webStream = Readable.toWeb(stream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': (stat.metaData?.['content-type'] as string) ?? 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[media proxy]', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
