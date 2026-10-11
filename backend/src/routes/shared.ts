import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { requireAdmin } from "../auth.js";
import { env } from "../env.js";
import { GitHubNotConfiguredError } from "../github.js";

/**
 * A router for admin endpoints that edit the repo: admin-only, 503 until a
 * GitHub token is configured, and with the shared error translations.
 * Mount `repoErrorHandler` after all routers built this way.
 */
export function adminGitRouter() {
  const router = Router();
  router.use(requireAdmin);
  router.use((_req, res, next) => {
    if (!env.GITHUB_TOKEN) {
      res.status(503).json({ error: "gallery_not_configured" });
      return;
    }
    next();
  });
  return router;
}

/** Mounted after all repo-editing routers. */
export function repoErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof GitHubNotConfiguredError) {
    res.status(503).json({ error: "gallery_not_configured" });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(413).json({ error: err.code === "LIMIT_FILE_SIZE" ? "file_too_large" : "too_many_files" });
    return;
  }
  next(err);
}
