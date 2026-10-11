"use client";

import { Check, Images, Inbox, LayoutGrid, LogOut, MessageCircle, Phone, RefreshCw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  API_URL,
  UnauthorizedError,
  adminLogin,
  fetchLeads,
  setLeadStatus,
  type Lead,
} from "@/lib/api";
import { site } from "@/lib/site.config";
import CategoriesManager from "./CategoriesManager";
import GalleryManager from "./GalleryManager";
import { CHIP, FIELD, GHOST, PRIMARY } from "./styles";

const TOKEN_KEY = "mitogal-admin-token";

type Filter = "new" | "contacted" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "new", label: "חדשות" },
  { value: "contacted", label: "טופלו" },
  { value: "all", label: "הכל" },
];

// sessionStorage can throw in private windows; the page still works, the
// login just doesn't survive a reload.
function readToken(): string | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw) as { token: string; expiresAt: number };
    return expiresAt > Date.now() ? token : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

// Held in memory too, so signing in still works when storage is blocked.
let memoryToken: string | null = null;

function writeToken(value: { token: string; expiresAt: number } | null) {
  memoryToken = value?.token ?? null;
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `undefined` during server render, so nothing flashes before hydration. */
function useToken(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readToken() ?? memoryToken,
    () => undefined,
  );
}

function formatDate(iso: string | null): string | null {
  const m = iso && /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : null;
}

function formatReceived(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));
}

/** 050-1234567 → 972501234567, for wa.me. Returns null if it doesn't parse. */
function toIntl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0") && digits.length >= 9) return `972${digits.slice(1)}`;
  return null;
}

export default function AdminDashboard() {
  const token = useToken();
  const signOut = useCallback(() => writeToken(null), []);

  if (token === undefined) return null;

  return (
    <section className="mx-auto min-h-[70svh] max-w-[900px] px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      {!API_URL ? (
        <p className="rounded-[1rem] bg-cat-proposals-tint px-4 py-3 text-ink">
          חסר המשתנה <code dir="ltr">NEXT_PUBLIC_API_URL</code> — הגדירו אותו ובנו מחדש.
        </p>
      ) : token ? (
        <AdminShell token={token} onSignOut={signOut} />
      ) : (
        <LoginForm onLogin={writeToken} />
      )}
    </section>
  );
}

type Section = "leads" | "gallery" | "categories";

const SECTIONS: { value: Section; label: string; icon: typeof Inbox }[] = [
  { value: "leads", label: "פניות", icon: Inbox },
  { value: "gallery", label: "גלריה", icon: Images },
  { value: "categories", label: "כרטיסיות", icon: LayoutGrid },
];

function AdminShell({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [section, setSection] = useState<Section>("leads");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="ניהול" className="flex flex-wrap gap-2">
          {SECTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-current={section === value ? "page" : undefined}
              onClick={() => setSection(value)}
              className={`${CHIP(section === value)} inline-flex items-center gap-2`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={onSignOut} className={GHOST}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          יציאה
        </button>
      </div>

      <div className="mt-10">
        {section === "leads" && <LeadsView token={token} onSignOut={onSignOut} />}
        {section === "gallery" && <GalleryManager token={token} onSignOut={onSignOut} />}
        {section === "categories" && <CategoriesManager token={token} onSignOut={onSignOut} />}
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (s: { token: string; expiresAt: number }) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setBusy(true);
    setError(null);
    try {
      onLogin(await adminLogin(password));
    } catch (err) {
      setError(
        err instanceof UnauthorizedError
          ? "הסיסמה לא נכונה."
          : err instanceof Error && err.message === "rate_limited"
            ? "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה."
            : "לא הצלחנו להתחבר לשרת. נסו שוב.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-[1.75rem] bg-surface p-6 shadow-ink-lg sm:p-8">
      <h1 className="font-display text-h2 font-semibold text-ink">כניסה לניהול</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="password" className="block text-label font-semibold uppercase text-muted">
            סיסמה
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            dir="ltr"
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className={`${FIELD} mt-2`}
          />
        </div>
        {error && (
          <p id="login-error" role="alert" className="text-sm font-semibold text-cat-proposals-deep">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${PRIMARY} w-full`}>
          {busy ? "מתחברים…" : "כניסה"}
        </button>
      </form>
    </div>
  );
}

function LeadsView({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("new");
  const [loading, setLoading] = useState(false);

  const [version, setVersion] = useState(0);

  // Every state update here happens in a promise callback, after the fetch.
  useEffect(() => {
    let cancelled = false;
    fetchLeads(token)
      .then(({ leads }) => !cancelled && setLeads(leads))
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) onSignOut();
        else setError(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, onSignOut, version]);

  function refresh() {
    setLoading(true);
    setError(false);
    setVersion((v) => v + 1);
  }

  async function toggle(lead: Lead) {
    const next = lead.status === "new" ? "contacted" : "new";
    // Optimistic: the list updates immediately, and rolls back on failure.
    setLeads((ls) => ls?.map((l) => (l.id === lead.id ? { ...l, status: next } : l)) ?? null);
    try {
      await setLeadStatus(token, lead.id, next);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onSignOut();
      setLeads((ls) => ls?.map((l) => (l.id === lead.id ? lead : l)) ?? null);
      setError(true);
    }
  }

  const counts = {
    new: leads?.filter((l) => l.status === "new").length ?? 0,
    contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
    all: leads?.length ?? 0,
  };
  const visible = leads?.filter((l) => filter === "all" || l.status === filter) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label font-semibold uppercase text-muted">{site.name}</p>
          <h1 className="mt-1 font-display text-h1 font-semibold text-ink">פניות מהאתר</h1>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className={GHOST}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          רענון
        </button>
      </div>

      <div role="tablist" aria-label="סינון פניות" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={CHIP(filter === f.value)}
          >
            {f.label} <span className="tabular-nums opacity-70">({counts[f.value]})</span>
          </button>
        ))}
      </div>

      <div role="status" aria-live="polite">
        {error && (
          <p className="mt-6 rounded-[1rem] bg-cat-proposals-tint px-4 py-3 text-sm text-ink">
            משהו השתבש מול השרת. נסו ללחוץ רענון.
          </p>
        )}
      </div>

      {leads === null ? (
        !error && <p className="mt-10 text-muted">טוען…</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-muted">
          {filter === "new" ? "אין פניות חדשות. הכל מטופל." : "אין פניות להצגה."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onToggle={() => void toggle(lead)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({ lead, onToggle }: { lead: Lead; onToggle: () => void }) {
  const intl = lead.phone ? toIntl(lead.phone) : null;
  const eventDate = formatDate(lead.event_date);
  const done = lead.status === "contacted";

  return (
    <li
      className={`rounded-[1.5rem] bg-surface p-5 shadow-ink sm:p-6 ${done ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h2 className="min-w-0 break-words font-display text-h3 font-semibold text-ink">
          {lead.name}
        </h2>
        <p className="text-sm text-muted tabular-nums">{formatReceived(lead.created_at)}</p>
      </div>

      {(lead.event_type || eventDate) && (
        <p className="mt-2 text-sm text-ink">
          {lead.event_type}
          {lead.event_type && eventDate && " · "}
          {eventDate && <span className="tabular-nums">{eventDate}</span>}
        </p>
      )}

      {lead.message && (
        <p className="mt-3 whitespace-pre-line break-words text-base text-ink">{lead.message}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} dir="ltr" className={GHOST}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            {lead.phone}
          </a>
        )}
        {intl && (
          <a
            href={`https://wa.me/${intl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={GHOST}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            וואטסאפ
          </a>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`${GHOST} ms-auto ${done ? "" : "border-brand-deep bg-brand-tint"}`}
        >
          {done ? (
            <>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              החזרה לחדשות
            </>
          ) : (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              סימון כמטופל
            </>
          )}
        </button>
      </div>
    </li>
  );
}
