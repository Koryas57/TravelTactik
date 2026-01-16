import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.NEON_DB_URL;
  if (!url) {
    throw new Error("Missing NEON_DB_URL env var");
  }
  return neon(url);
}
