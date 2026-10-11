import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { migrate, pool } from "./db.js";
import { env } from "./env.js";
import { adminRouter } from "./routes/admin.js";
import { categoriesRouter } from "./routes/categories.js";
import { galleryRouter } from "./routes/gallery.js";
import { leadsRouter } from "./routes/leads.js";
import { repoErrorHandler } from "./routes/shared.js";

const app = express();

// Railway terminates TLS at one proxy hop; without this every visitor would
// share the proxy's IP and one rate limit.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] }));
app.use(express.json({ limit: "16kb" }));

/** Railway's healthcheck. Also confirms the database is reachable. */
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.use("/api/leads", leadsRouter);
app.use("/api/admin/gallery", galleryRouter);
app.use("/api/admin/categories", categoriesRouter);
app.use("/api/admin", repoErrorHandler);
app.use("/api/admin", adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

// Express 5 forwards rejected promises from async handlers here.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

await migrate();

const server = app.listen(env.PORT, () => {
  console.log(`mitogal-backend listening on :${env.PORT}`);
});

// Railway sends SIGTERM on redeploy; finish in-flight requests first.
process.on("SIGTERM", () => {
  server.close(() => {
    void pool.end().then(() => process.exit(0));
  });
});
