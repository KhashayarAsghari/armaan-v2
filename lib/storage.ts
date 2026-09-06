import { Client } from 'minio';

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    const endPoint = process.env.MINIO_ENDPOINT;
    if (!endPoint) {
      throw new Error('MINIO_ENDPOINT is not set. See .env.example for the required MinIO variables.');
    }
    _client = new Client({
      endPoint,
      port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? '',
      secretKey: process.env.MINIO_SECRET_KEY ?? '',
    });
  }
  return _client;
}

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'armaan-uploads';

/** Creates the bucket if it doesn't already exist. Safe to call on every cold start. */
export async function ensureBucket(): Promise<void> {
  const client = getClient();
  const exists = await client.bucketExists(MINIO_BUCKET).catch(() => false);
  if (!exists) {
    await client.makeBucket(MINIO_BUCKET);
  }
}

export async function uploadBuffer(
  objectKey: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const client = getClient();
  await ensureBucket();
  await client.putObject(MINIO_BUCKET, objectKey, buffer, buffer.length, {
    'Content-Type': contentType,
  });
}

export async function getObjectStream(objectKey: string) {
  const client = getClient();
  return client.getObject(MINIO_BUCKET, objectKey);
}

export async function statObject(objectKey: string) {
  const client = getClient();
  return client.statObject(MINIO_BUCKET, objectKey);
}

export async function removeObject(objectKey: string): Promise<void> {
  const client = getClient();
  await client.removeObject(MINIO_BUCKET, objectKey);
}

/**
 * We serve every uploaded file through our own `/api/media/[...key]` proxy route
 * instead of exposing the MinIO endpoint directly. This lets us:
 *  - keep the bucket private (no public read policy needed on MinIO itself)
 *  - avoid ever leaking MinIO host/credentials to the browser
 *  - add caching headers / future access checks in one place
 *  - swap storage backends later without touching stored content URLs
 * The tradeoff (extra hop through the Next.js server for every file) is
 * acceptable at this project's scale; if traffic grows, put a CDN in front
 * of `/api/media/*` or switch to presigned URLs + a public bucket.
 */
export function publicUrlFor(objectKey: string): string {
  return `/api/media/${objectKey}`;
}
