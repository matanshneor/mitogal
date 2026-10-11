/**
 * Every setting the server reads, validated once at boot.
 *
 * A missing secret fails the deploy immediately with a readable message,
 * instead of surfacing later as a 500 on the first admin login.
 */
import { z } from "zod";

const schema = z.object({
  /** Railway injects PORT; 4000 is only the local default. */
  PORT: z.coerce.number().int().positive().default(4000),

  /** On Railway: ${{Postgres.DATABASE_URL}} */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /**
   * Railway's private network (*.railway.internal) does not use TLS.
   * Set to "true" only when connecting through a public proxy URL.
   */
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  /**
   * Comma-separated list of origins allowed to call the API — the public
   * site's domain(s). Example: https://mitogal.co.il,https://www.mitogal.co.il
   */
  CORS_ORIGINS: z
    .string()
    .min(1, "CORS_ORIGINS is required")
    .transform((v) =>
      v
        .split(",")
        .map((o) => o.trim().replace(/\/$/, ""))
        .filter(Boolean),
    ),

  /** The password Gal types on /admin. */
  ADMIN_PASSWORD: z.string().min(10, "ADMIN_PASSWORD must be at least 10 characters"),

  /** Signs admin session tokens. Any long random string. */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  /**
   * Gallery management commits photos to the repo, and Railway redeploys the
   * frontend from that commit. A fine-grained token scoped to this one repo
   * with "Contents: Read and write". Optional: without it the server runs and
   * only the gallery endpoints answer 503.
   */
  GITHUB_TOKEN: z.string().min(1).optional(),
  GITHUB_REPO: z.string().regex(/^[\w.-]+\/[\w.-]+$/).default("matanshneor/mitogal"),
  GITHUB_BRANCH: z.string().min(1).default("main"),
  /** Overridable only so tests can point at a fake GitHub. */
  GITHUB_API_URL: z.string().url().default("https://api.github.com"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
