"use client";

import { ChevronDown, ChevronUp, ImagePlus, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  UnauthorizedError,
  deletePhoto,
  fetchCategories,
  fetchGallery,
  saveGalleryOrder,
  updatePhoto,
  uploadPhotos,
  type Category,
  type GalleryItem,
} from "@/lib/api";
import { CHIP, FIELD, GHOST, LABEL, NOTICE, PRIMARY } from "./styles";
import { useRepoAction } from "./useRepoAction";

const ERRORS: Record<string, string> = {
  file_too_large: "אחת התמונות גדולה מדי (מעל 25MB).",
  too_many_files: "אפשר להעלות עד 10 תמונות בכל פעם.",
  unreadable_image: "אחד הקבצים הוא לא תמונה שאפשר לפתוח.",
  invalid_upload: "צריך לבחור קטגוריה ולפחות תמונה אחת.",
  not_found: "התמונה כבר לא קיימת. לחצו רענון.",
};

export default function GalleryManager({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  // Fetched rather than imported: a category added a minute ago is already
  // in the repo but not yet in this build.
  const [categories, setCategories] = useState<Category[]>([]);
  /** Unsaved reorder. While set, the grid shows it and other actions wait. */
  const [draft, setDraft] = useState<GalleryItem[] | null>(null);
  const [filter, setFilter] = useState("all");
  const { busy, notice, setNotice, run, messageFor } = useRepoAction(onSignOut, ERRORS);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchGallery(token), fetchCategories(token)])
      .then(([{ items }, { categories }]) => {
        if (cancelled) return;
        setItems(items);
        setCategories(categories);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) onSignOut();
        else setNotice({ kind: "error", text: messageFor(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [token, onSignOut, version, messageFor, setNotice]);

  function refresh() {
    setDraft(null);
    setNotice(null);
    setItems(null);
    setVersion((v) => v + 1);
  }

  const shown = draft ?? items ?? [];
  const labelOf = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const visible = shown.filter((it) => filter === "all" || it.category === filter);

  /** Swap with the neighbour in the current view, wherever it sits in the full list. */
  function move(id: string, direction: -1 | 1) {
    const pos = visible.findIndex((it) => it.id === id);
    const neighbour = visible[pos + direction];
    if (!neighbour) return;
    const next = [...shown];
    const a = next.findIndex((it) => it.id === id);
    const b = next.findIndex((it) => it.id === neighbour.id);
    [next[a], next[b]] = [next[b]!, next[a]!];
    setDraft(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-semibold text-ink">גלריה</h1>
          {items && <p className="mt-1 text-muted">{items.length} תמונות באתר</p>}
        </div>
        <button type="button" onClick={refresh} disabled={busy} className={GHOST}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          רענון
        </button>
      </div>

      <div role="status" aria-live="polite">
        {notice && (
          <p
            className={`mt-6 ${NOTICE} ${notice.kind === "ok" ? "bg-cat-holidays-tint" : "bg-cat-proposals-tint"}`}
          >
            {notice.text}
          </p>
        )}
      </div>

      <UploadForm
        categories={categories}
        disabled={busy || !!draft || items === null}
        onUpload={(form, count) =>
          run(async () => {
            await uploadPhotos(token, form);
            setItems((await fetchGallery(token)).items);
          }, count === 1 ? "התמונה נוספה." : `${count} תמונות נוספו.`)
        }
      />

      <div role="tablist" aria-label="סינון לפי קטגוריה" className="mt-10 flex flex-wrap gap-2">
        {[{ slug: "all", label: "הכל" }, ...categories].map((s) => (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={filter === s.slug}
            onClick={() => setFilter(s.slug)}
            className={CHIP(filter === s.slug)}
          >
            {s.label}{" "}
            <span className="tabular-nums opacity-70">
              ({s.slug === "all" ? shown.length : shown.filter((it) => it.category === s.slug).length})
            </span>
          </button>
        ))}
      </div>

      {items === null ? (
        notice?.kind !== "error" && <p className="mt-10 text-muted">טוען…</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-muted">אין תמונות בקטגוריה הזו עדיין.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item, i) => (
            <PhotoCard
              key={item.id}
              item={item}
              categories={categories}
              categoryLabel={labelOf(item.category)}
              first={i === 0}
              last={i === visible.length - 1}
              locked={busy}
              reordering={!!draft}
              onMove={(d) => move(item.id, d)}
              onSave={(changes) =>
                run(async () => {
                  const { item: saved } = await updatePhoto(token, item.id, changes);
                  setItems((all) => all?.map((it) => (it.id === saved.id ? saved : it)) ?? null);
                  if (changes.category) setItems((await fetchGallery(token)).items);
                }, "השינוי נשמר.")
              }
              onDelete={() =>
                run(async () => {
                  await deletePhoto(token, item.id);
                  setItems((all) => all?.filter((it) => it.id !== item.id) ?? null);
                }, "התמונה נמחקה.")
              }
            />
          ))}
        </ul>
      )}

      {draft && (
        <div className="sticky bottom-4 z-10 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-ink px-5 py-4 text-white shadow-ink-lg">
          <p className="text-sm">שיניתם את הסדר. לשמור?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={busy}
              className="min-h-11 rounded-full px-4 text-sm font-semibold text-white/80 hover:text-white"
            >
              ביטול
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await saveGalleryOrder(token, draft.map((it) => it.id));
                  setItems(draft);
                  setDraft(null);
                }, "הסדר החדש נשמר.")
              }
              className={`${PRIMARY} min-h-11`}
            >
              {busy ? "שומר…" : "שמירת הסדר"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({
  categories,
  disabled,
  onUpload,
}: {
  categories: Category[];
  disabled: boolean;
  onUpload: (form: FormData, count: number) => Promise<boolean>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function pick(list: FileList | null) {
    const chosen = Array.from(list ?? []).slice(0, 10);
    setFiles(chosen);
    setPreviews(chosen.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData();
    form.set("category", category);
    const alt = String(new FormData(e.currentTarget).get("alt") ?? "").trim();
    if (alt) form.set("alt", alt);
    files.forEach((f) => form.append("photos", f));
    // Keep the selection on failure so Gal can just try again.
    if (!(await onUpload(form, files.length))) return;
    formRef.current?.reset();
    setFiles([]);
    setPreviews([]);
    setCategory("");
  }

  const ready = files.length > 0 && category !== "";

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="mt-8 space-y-6 rounded-[1.75rem] bg-surface p-5 shadow-ink sm:p-7"
    >
      <h2 className="font-display text-h3 font-semibold text-ink">הוספת תמונות</h2>

      <div>
        <label
          htmlFor="photos"
          className={`${GHOST} cursor-pointer border-dashed border-brand-deep bg-brand-tint ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
          {files.length ? `נבחרו ${files.length} תמונות — לבחור אחרות` : "בחירת תמונות (עד 10)"}
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={(e) => pick(e.target.files)}
          className="sr-only"
        />
        {previews.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="התמונות שנבחרו">
            {previews.map((url, i) => (
              <li key={url} className="h-20 w-20 overflow-hidden rounded-[0.75rem] bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={url} alt={`תמונה ${i + 1}`} className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="upload-category" className={LABEL}>
            קטגוריה *
          </label>
          <select
            id="upload-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
            required
            className={`${FIELD} mt-2`}
          >
            <option value="">בחרו קטגוריה</option>
            {categories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="upload-alt" className={LABEL}>
            מה רואים בתמונה? (רשות)
          </label>
          <input
            id="upload-alt"
            name="alt"
            type="text"
            maxLength={300}
            disabled={disabled}
            placeholder="למשל: שולחן מתוקים ממותג לבת מצווה"
            className={`${FIELD} mt-2`}
          />
        </div>
      </div>
      <p className="text-sm text-muted">
        התיאור עוזר לגוגל להבין את התמונה, ולאנשים עם לקויות ראייה לשמוע מה יש בה.
      </p>

      <button type="submit" disabled={disabled || !ready} className={`${PRIMARY} w-full sm:w-auto`}>
        {disabled && ready ? "מעלה…" : "העלאה לאתר"}
      </button>
    </form>
  );
}

function PhotoCard({
  item,
  categories,
  categoryLabel,
  first,
  last,
  locked,
  reordering,
  onMove,
  onSave,
  onDelete,
}: {
  item: GalleryItem;
  categories: Category[];
  categoryLabel: string;
  first: boolean;
  last: boolean;
  locked: boolean;
  reordering: boolean;
  onMove: (direction: -1 | 1) => void;
  onSave: (changes: { alt?: string; category?: string }) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [missing, setMissing] = useState(false);
  const ICON = "flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand-tint disabled:opacity-30";

  return (
    <li className="overflow-hidden rounded-[1.25rem] bg-surface shadow-ink">
      <div className="relative aspect-square bg-paper">
        {item.src && !missing ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
            onError={() => setMissing(true)}
          />
        ) : (
          // Just uploaded: the file is committed but the site hasn't redeployed yet.
          <p className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
            תופיע באתר בעוד כמה דקות
          </p>
        )}
      </div>

      <div className="p-3">
        <p className="text-label font-semibold uppercase text-muted">{categoryLabel}</p>

        {mode === "edit" ? (
          <EditForm item={item} categories={categories} onCancel={() => setMode("view")} onSave={(c) => onSave(c).then((ok) => ok && setMode("view"))} />
        ) : mode === "confirm-delete" ? (
          <div className="mt-2">
            <p className="text-sm font-semibold text-ink">למחוק את התמונה מהאתר?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={locked}
                onClick={() => void onDelete()}
                className="min-h-10 flex-1 rounded-full bg-cat-proposals-deep px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {locked ? "מוחק…" : "כן, למחוק"}
              </button>
              <button type="button" onClick={() => setMode("view")} className={`${GHOST} min-h-10 flex-1`}>
                לא
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 line-clamp-2 text-sm text-ink">{item.alt}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex">
                <button type="button" disabled={first || locked} onClick={() => onMove(-1)} aria-label="להזיז קדימה" className={ICON}>
                  <ChevronUp className="h-5 w-5" aria-hidden="true" />
                </button>
                <button type="button" disabled={last || locked} onClick={() => onMove(1)} aria-label="להזיז אחורה" className={ICON}>
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex">
                <button type="button" disabled={locked || reordering} onClick={() => setMode("edit")} aria-label="עריכה" className={ICON}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" disabled={locked || reordering} onClick={() => setMode("confirm-delete")} aria-label="מחיקה" className={ICON}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function EditForm({
  item,
  categories,
  onCancel,
  onSave,
}: {
  item: GalleryItem;
  categories: Category[];
  onCancel: () => void;
  onSave: (changes: { alt?: string; category?: string }) => Promise<unknown>;
}) {
  const [alt, setAlt] = useState(item.alt);
  const [category, setCategory] = useState(item.category);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const changes = {
      ...(alt.trim() !== item.alt ? { alt: alt.trim() } : {}),
      ...(category !== item.category ? { category } : {}),
    };
    if (!Object.keys(changes).length) return onCancel();
    setSaving(true);
    await onSave(changes);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-3">
      <label className="sr-only" htmlFor={`alt-${item.id}`}>
        תיאור
      </label>
      <textarea
        id={`alt-${item.id}`}
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        rows={3}
        maxLength={300}
        required
        className="w-full rounded-[0.75rem] border-2 border-line p-2 text-sm text-ink focus:border-brand-deep focus:outline-none"
      />
      <label className="sr-only" htmlFor={`cat-${item.id}`}>
        קטגוריה
      </label>
      <select
        id={`cat-${item.id}`}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="min-h-10 w-full rounded-[0.75rem] border-2 border-line bg-surface px-2 text-sm text-ink"
      >
        {categories.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="min-h-10 flex-1 rounded-full bg-brand px-3 text-sm font-semibold text-ink disabled:opacity-60">
          {saving ? "שומר…" : "שמירה"}
        </button>
        <button type="button" onClick={onCancel} aria-label="ביטול" className={`${GHOST} min-h-10 px-3`}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
