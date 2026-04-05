// Environment-aware DB accessor.
// In local dev (DB_PATH set, no DATABASE_URL): uses better-sqlite3.
// On Vercel (DATABASE_URL set): swap this file for @vercel/postgres queries.

export { db } from "./db-local";
