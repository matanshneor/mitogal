"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ICONS, PALETTE } from "@/data/services";
import {
  UnauthorizedError,
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchGallery,
  saveCategoryOrder,
  updateCategory,
  type Category,
  type CategoryFields,
} from "@/lib/api";
import { site } from "@/lib/site.config";
import { FIELD, GHOST, LABEL, NOTICE, PRIMARY } from "./styles";
import { useRepoAction } from "./useRepoAction";

const ERRORS: Record<string, string> = {
  invalid_category: "חסר אחד השדות, או שהשם באנגלית לא תקין (רק אותיות באנגלית, מספרים ומקפים).",
  duplicate_label: "כבר יש כרטיסייה בשם הזה.",
  duplicate_slug: "השם באנגלית כבר תפוס. בחרו שם אחר.",
  has_photos: "יש בכרטיסייה הזו תמונות. קודם מעבירים אותן לכרטיסייה אחרת או מוחקים אותן, בלשונית גלריה.",
  last_category: "חייבת להישאר לפחות כרטיסייה אחת.",
  not_found: "הכרטיסייה כבר לא קיימת. לחצו רענון.",
};

/** Read aloud by screen readers in the icon picker. */
const ICON_NAMES: Record<string, string> = {
  Gem: "יהלום",
  Gift: "מתנה",
  Heart: "לב",
  Cake: "עוגה",
  Sparkles: "נצנצים",
  Palette: "פלטת צבעים",
  Baby: "תינוק",
  Star: "כוכב",
  Crown: "כתר",
  Flower2: "פרח",
  PartyPopper: "קונפטי",
  GraduationCap: "כובע סיום",
  Balloon: "בלון",
  BookOpen: "ספר פתוח",
  Candy: "סוכרייה",
  Camera: "מצלמה",
};

const EMPTY: CategoryFields = {
  label: "",
  labelSingular: "",
  tagline: "",
  pageTitle: "",
  pageIntro: "",
  icon: "Sparkles",
  color: "sky",
};

/** The services-grid tile exactly as the home page draws it. */
function Tile({ fields }: { fields: Pick<CategoryFields, "label" | "tagline" | "icon" | "color"> }) {
  const Icon = ICONS[fields.icon] ?? Sparkles;
  const bg = PALETTE[fields.color]?.classes.bg ?? "bg-brand";
  return (
    <div className={`flex flex-col items-start gap-2 rounded-[1.25rem] p-4 text-ink ${bg}`}>
      <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      <span className="font-display text-base font-semibold">{fields.label || "שם הכרטיסייה"}</span>
      <span className="text-xs text-ink/70">{fields.tagline || "משפט קצר"}</span>
    </div>
  );
}

export default function CategoriesManager({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<Category[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [version, setVersion] = useState(0);
  const { busy, notice, setNotice, run, messageFor } = useRepoAction(onSignOut, ERRORS);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCategories(token), fetchGallery(token)])
      .then(([{ categories }, { items }]) => {
        if (cancelled) return;
        setCategories(categories);
        const counts: Record<string, number> = {};
        for (const it of items) counts[it.category] = (counts[it.category] ?? 0) + 1;
        setPhotoCounts(counts);
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
    setCategories(null);
    setVersion((v) => v + 1);
  }

  const shown = draft ?? categories ?? [];

  function move(index: number, direction: -1 | 1) {
    const next = [...shown];
    const other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other]!, next[index]!];
    setDraft(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-semibold text-ink">כרטיסיות</h1>
          <p className="mt-1 text-muted">סוגי האירועים שמופיעים בעמוד הבית</p>
        </div>
        <button type="button" onClick={refresh} disabled={busy} className={GHOST}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          רענון
        </button>
      </div>

      <div role="status" aria-live="polite">
        {notice && (
          <p className={`mt-6 ${NOTICE} ${notice.kind === "ok" ? "bg-cat-holidays-tint" : "bg-cat-proposals-tint"}`}>
            {notice.text}
          </p>
        )}
      </div>

      {adding ? (
        <div className="mt-8 rounded-[1.75rem] bg-surface p-5 shadow-ink sm:p-7">
          <h2 className="font-display text-h3 font-semibold text-ink">כרטיסייה חדשה</h2>
          <CategoryForm
            initial={EMPTY}
            withSlug
            busy={busy}
            submitLabel="הוספה לאתר"
            onCancel={() => setAdding(false)}
            onSubmit={(fields) =>
              run(async () => {
                const { category } = await createCategory(token, fields);
                setCategories((all) => [...(all ?? []), category]);
                setAdding(false);
              }, `הכרטיסייה "${fields.label}" נוספה.`)
            }
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={busy || !!draft || categories === null}
          className={`${PRIMARY} mt-8`}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          הוספת כרטיסייה
        </button>
      )}

      {categories === null ? (
        notice?.kind !== "error" && <p className="mt-10 text-muted">טוען…</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {shown.map((category, i) => (
            <CategoryRow
              key={category.slug}
              category={category}
              photos={photoCounts[category.slug] ?? 0}
              first={i === 0}
              last={i === shown.length - 1}
              locked={busy}
              reordering={!!draft}
              onMove={(d) => move(i, d)}
              onSave={(changes) =>
                run(async () => {
                  const { category: saved } = await updateCategory(token, category.slug, changes);
                  setCategories((all) => all?.map((c) => (c.slug === saved.slug ? saved : c)) ?? null);
                }, "השינוי נשמר.")
              }
              onDelete={() =>
                run(async () => {
                  await deleteCategory(token, category.slug);
                  setCategories((all) => all?.filter((c) => c.slug !== category.slug) ?? null);
                }, `הכרטיסייה "${category.label}" נמחקה.`)
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
                  await saveCategoryOrder(token, draft.map((c) => c.slug));
                  setCategories(draft);
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

function CategoryRow({
  category,
  photos,
  first,
  last,
  locked,
  reordering,
  onMove,
  onSave,
  onDelete,
}: {
  category: Category;
  photos: number;
  first: boolean;
  last: boolean;
  locked: boolean;
  reordering: boolean;
  onMove: (direction: -1 | 1) => void;
  onSave: (changes: Partial<CategoryFields>) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const ICON = "flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand-tint disabled:opacity-30";

  if (mode === "edit") {
    const fields = Object.fromEntries(
      Object.entries(category).filter(([key]) => key !== "slug"),
    ) as CategoryFields;
    return (
      <li className="rounded-[1.5rem] bg-surface p-5 shadow-ink sm:p-6">
        <h2 className="font-display text-h3 font-semibold text-ink">{`עריכת "${category.label}"`}</h2>
        <CategoryForm
          initial={fields}
          busy={locked}
          submitLabel="שמירה"
          onCancel={() => setMode("view")}
          onSubmit={async (next) => {
            const changes = Object.fromEntries(
              Object.entries(next).filter(([k, v]) => fields[k as keyof CategoryFields] !== v),
            ) as Partial<CategoryFields>;
            if (!Object.keys(changes).length) return setMode("view");
            if (await onSave(changes)) setMode("view");
          }}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-4 rounded-[1.5rem] bg-surface p-4 shadow-ink sm:flex-row sm:items-center sm:p-5">
      <div className="sm:w-56 sm:shrink-0">
        <Tile fields={category} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">
          {photos === 0 ? "אין תמונות" : `${photos} תמונות`} ·{" "}
          <span dir="ltr">/gallery/{category.slug}</span>
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-ink">{category.pageTitle}</p>

        {mode === "confirm-delete" ? (
          <div className="mt-3">
            {photos > 0 ? (
              <>
                <p className="text-sm text-ink">
                  אי אפשר למחוק כרטיסייה שיש בה תמונות ({photos}). קודם מעבירים אותן לכרטיסייה
                  אחרת או מוחקים אותן, בלשונית גלריה.
                </p>
                <button type="button" onClick={() => setMode("view")} className={`${GHOST} mt-2`}>
                  הבנתי
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink">
                  {`למחוק את "${category.label}"? הכרטיסייה והעמוד שלה ייעלמו מהאתר.`}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void onDelete()}
                    className="min-h-11 rounded-full bg-cat-proposals-deep px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {locked ? "מוחק…" : "כן, למחוק"}
                  </button>
                  <button type="button" onClick={() => setMode("view")} className={GHOST}>
                    לא
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex">
              <button type="button" disabled={first || locked} onClick={() => onMove(-1)} aria-label={`להזיז את ${category.label} קדימה`} className={ICON}>
                <ChevronUp className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" disabled={last || locked} onClick={() => onMove(1)} aria-label={`להזיז את ${category.label} אחורה`} className={ICON}>
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex">
              <button type="button" disabled={locked || reordering} onClick={() => setMode("edit")} aria-label={`עריכת ${category.label}`} className={ICON}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" disabled={locked || reordering} onClick={() => setMode("confirm-delete")} aria-label={`מחיקת ${category.label}`} className={ICON}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function CategoryForm({
  initial,
  withSlug = false,
  busy,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: CategoryFields;
  withSlug?: boolean;
  busy: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (fields: CategoryFields & { slug?: string }) => Promise<unknown>;
}) {
  const [fields, setFields] = useState(initial);
  const [slug, setSlug] = useState("");
  const set = <K extends keyof CategoryFields>(key: K, value: CategoryFields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.trim()]),
    ) as CategoryFields;
    void onSubmit(withSlug && slug.trim() ? { ...trimmed, slug: slug.trim().toLowerCase() } : trimmed);
  }

  const text = (key: keyof CategoryFields, label: string, hint: string, max: number) => (
    <div>
      <label htmlFor={`cat-${key}`} className={LABEL}>
        {label} *
      </label>
      <input
        id={`cat-${key}`}
        value={fields[key]}
        onChange={(e) => set(key, e.target.value)}
        required
        maxLength={max}
        aria-describedby={`cat-${key}-hint`}
        className={`${FIELD} mt-2`}
      />
      <p id={`cat-${key}-hint`} className="mt-1 text-xs text-muted">
        {hint}
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-7">
      <div className="max-w-56">
        <p className={`${LABEL} mb-2`}>כך זה ייראה בעמוד הבית</p>
        <Tile fields={fields} />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        {text("label", "שם", 'ברבים, כמו בכרטיסייה. למשל: "בר ובת מצווה"', 40)}
        {text("labelSingular", "שם ביחיד", 'למשל: "בר מצווה" (לתוך משפטים כמו "עיצוב ל...")', 40)}
      </div>
      {text("tagline", "משפט קצר", "מופיע מתחת לשם בכרטיסייה", 80)}
      {text("pageTitle", "כותרת העמוד", "הכותרת הגדולה בעמוד של הכרטיסייה", 80)}

      <div>
        <label htmlFor="cat-pageIntro" className={LABEL}>
          פסקת פתיחה *
        </label>
        <textarea
          id="cat-pageIntro"
          value={fields.pageIntro}
          onChange={(e) => set("pageIntro", e.target.value)}
          required
          maxLength={600}
          rows={4}
          className={`${FIELD} mt-2 resize-y`}
        />
        <p className="mt-1 text-xs text-muted">מופיעה מתחת לכותרת בעמוד של הכרטיסייה</p>
      </div>

      <fieldset>
        <legend className={LABEL}>אייקון *</legend>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <label
              key={name}
              className={`flex h-14 cursor-pointer items-center justify-center rounded-[1rem] border-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-deep ${
                fields.icon === name ? "border-ink bg-brand-tint" : "border-line hover:border-brand-deep"
              }`}
            >
              <input
                type="radio"
                name="icon"
                value={name}
                checked={fields.icon === name}
                onChange={() => set("icon", name)}
                className="sr-only"
              />
              <Icon className="h-6 w-6 text-ink" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">{ICON_NAMES[name] ?? name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={LABEL}>צבע *</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(PALETTE).map(([key, swatch]) => (
            <label
              key={key}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 py-1 pe-4 ps-1 text-sm font-semibold text-ink transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-deep ${
                fields.color === key ? "border-ink" : "border-line hover:border-brand-deep"
              }`}
            >
              <input
                type="radio"
                name="color"
                value={key}
                checked={fields.color === key}
                onChange={() => set("color", key)}
                className="sr-only"
              />
              <span aria-hidden="true" className={`h-8 w-8 rounded-full ${swatch.classes.bg}`} />
              {swatch.name}
            </label>
          ))}
        </div>
      </fieldset>

      {withSlug && (
        <div>
          <label htmlFor="cat-slug" className={LABEL}>
            שם באנגלית לכתובת (רשות)
          </label>
          <input
            id="cat-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            dir="ltr"
            maxLength={40}
            pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*"
            placeholder="bar-mitzvah"
            aria-describedby="cat-slug-hint"
            className={`${FIELD} mt-2 text-end`}
          />
          <p id="cat-slug-hint" className="mt-1 text-xs text-muted">
            הכתובת של העמוד: <span dir="ltr">{site.url.replace("https://", "")}/gallery/{slug.trim().toLowerCase() || "…"}</span>.
            רק אותיות באנגלית, מספרים ומקפים. אי אפשר לשנות אחר כך. אם משאירים ריק, נבחר שם לבד.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? "שומר…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={GHOST}>
          ביטול
        </button>
      </div>
    </form>
  );
}
