#!/usr/bin/env node
/**
 * One-off migration: uploads every file currently in public/uploads to MinIO,
 * then rewrites any `/uploads/<filename>` references found inside
 * `post_translations.content` (rich text HTML) to the new `/api/media/...` URL.
 *
 * Usage (from the project root, with MINIO_* and DATABASE_URL set in the env):
 *   node scripts/migrate-uploads-to-minio.mjs
 *
 * Safe to re-run: re-uploading an existing object just overwrites it, and the
 * HTML replace step is a no-op once a URL has already been rewritten.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { Client } from 'minio';
import mysql from 'mysql2/promise';

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');
const BUCKET = process.env.MINIO_BUCKET ?? 'armaan-uploads';

const CONTENT_TYPE_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

async function main() {
  const endPoint = process.env.MINIO_ENDPOINT;
  if (!endPoint) {
    console.error('MINIO_ENDPOINT is not set. Export the MINIO_* env vars first (see .env.example).');
    process.exit(1);
  }

  const minio = new Client({
    endPoint,
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
  });

  const bucketExists = await minio.bucketExists(BUCKET).catch(() => false);
  if (!bucketExists) {
    console.log(`Creating bucket "${BUCKET}"...`);
    await minio.makeBucket(BUCKET);
  }

  let files;
  try {
    files = await readdir(UPLOADS_DIR);
  } catch {
    console.log('No public/uploads directory found — nothing to migrate.');
    files = [];
  }

  /** @type {Map<string, string>} old `/uploads/x` -> new `/api/media/content/x` */
  const urlMap = new Map();

  for (const filename of files) {
    const ext = extname(filename).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXT[ext];
    if (!contentType) {
      console.warn(`Skipping unrecognized file type: ${filename}`);
      continue;
    }
    const buffer = await readFile(join(UPLOADS_DIR, filename));
    const objectKey = `content/${filename}`;
    await minio.putObject(BUCKET, objectKey, buffer, buffer.length, { 'Content-Type': contentType });
    urlMap.set(`/uploads/${filename}`, `/api/media/${objectKey}`);
    console.log(`Uploaded ${filename} -> ${objectKey}`);
  }

  if (urlMap.size === 0) {
    console.log('No files uploaded; skipping database URL rewrite.');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.warn(
      'DATABASE_URL is not set — skipping the step that rewrites /uploads/... URLs inside post content.\n' +
      'Run this script again with DATABASE_URL set, or update those posts manually.'
    );
    return;
  }

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await conn.execute(
      'SELECT id, content FROM post_translations WHERE content IS NOT NULL'
    );
    let updated = 0;
    for (const row of rows) {
      let { content } = row;
      let changed = false;
      for (const [oldUrl, newUrl] of urlMap) {
        if (content.includes(oldUrl)) {
          content = content.split(oldUrl).join(newUrl);
          changed = true;
        }
      }
      if (changed) {
        await conn.execute('UPDATE post_translations SET content = ? WHERE id = ?', [content, row.id]);
        updated += 1;
      }
    }
    console.log(`Rewrote image URLs in ${updated} post_translations row(s).`);
  } finally {
    await conn.end();
  }

  console.log('\nDone. You can now remove public/uploads once you have verified the posts render correctly.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
