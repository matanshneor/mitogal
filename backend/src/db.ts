import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

/**
 * The schema is one table, so it is created on boot rather than through a
 * migration tool. `IF NOT EXISTS` makes every restart a no-op.
 */
export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id          BIGSERIAL PRIMARY KEY,
      name        TEXT        NOT NULL,
      phone       TEXT,
      event_type  TEXT,
      event_date  DATE,
      message     TEXT,
      status      TEXT        NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'contacted')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
  `);
}

export type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  message: string | null;
  status: "new" | "contacted";
  created_at: string;
};

// DATE columns come back as JS Date objects by default, which shifts them by
// the server's timezone. The admin page only needs the YYYY-MM-DD string.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);
