/**
 * Client for the backend service (../backend).
 *
 * NEXT_PUBLIC_API_URL is inlined at BUILD time, so on Railway it must be set
 * on the frontend service before the build runs — changing it later requires
 * a redeploy.
 */
import type { GalleryItem } from "@/data/gallery";
import type { LeadFields } from "@/lib/site.config";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/**
 * Record a lead without making the visitor wait for it.
 *
 * Not awaited by the form: WhatsApp has to open synchronously inside the
 * click, or popup blockers swallow it. `keepalive` lets the request finish
 * even if the tab navigates away.
 */
export function saveLead(lead: LeadFields & { website?: string }): void {
  if (!API_URL) return;
  fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    keepalive: true,
  }).catch(() => {
    // WhatsApp is the primary channel; a failed save must never block it.
  });
}

export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  message: string | null;
  status: "new" | "contacted";
  created_at: string;
};

export class UnauthorizedError extends Error {}

/** Carries the backend's error code (e.g. "file_too_large") for the UI to translate. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

async function adminFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...init,
    headers: {
      // FormData sets its own multipart Content-Type with the boundary.
      ...(typeof init?.body === "string" ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? `http_${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(password: string): Promise<{ token: string; expiresAt: number }> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function fetchLeads(token: string): Promise<{ leads: Lead[] }> {
  return adminFetch("/leads", token);
}

export function setLeadStatus(token: string, id: string, status: Lead["status"]): Promise<{ lead: Lead }> {
  return adminFetch(`/leads/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export type { GalleryItem };

export function fetchGallery(token: string): Promise<{ items: GalleryItem[] }> {
  return adminFetch("/gallery", token);
}

export function uploadPhotos(token: string, form: FormData): Promise<{ items: GalleryItem[] }> {
  return adminFetch("/gallery", token, { method: "POST", body: form });
}

export function updatePhoto(
  token: string,
  id: string,
  changes: { alt?: string; category?: string },
): Promise<{ item: GalleryItem }> {
  return adminFetch(`/gallery/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deletePhoto(token: string, id: string): Promise<{ ok: true }> {
  return adminFetch(`/gallery/${encodeURIComponent(id)}`, token, { method: "DELETE" });
}

export function saveGalleryOrder(token: string, ids: string[]): Promise<{ ok: true }> {
  return adminFetch("/gallery/order", token, { method: "PUT", body: JSON.stringify({ ids }) });
}
