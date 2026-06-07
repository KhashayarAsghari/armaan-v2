import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Lazy singleton — pool is NOT created at module load time, only on first query.
// This prevents build-time failures when DATABASE_URL is not set.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

function getInstance() {
  if (!_db) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _db = drizzle(mysql.createPool(process.env.DATABASE_URL) as any, { schema, mode: 'default' });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return getInstance()[prop];
  },
});
