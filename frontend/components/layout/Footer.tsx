import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import InstagramIcon from "@/components/ui/InstagramIcon";
import Logo from "@/components/ui/Logo";
import { services } from "@/data/services";
import { site, telHref, waDefaultMessage, waLink } from "@/lib/site.config";

const SOCIAL_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-full border-2 border-line text-ink transition-colors hover:border-brand-deep hover:text-brand-deep";

export default function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo variant="wordmark" size="lg" />

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`אינסטגרם — ${site.instagramHandle}`}
                className={SOCIAL_BUTTON}
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href={telHref}
                aria-label={`התקשרו אלינו — ${site.phoneDisplay}`}
                className={SOCIAL_BUTTON}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={waLink(waDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="וואטסאפ — פתיחת שיחה עם מיתוגל"
                className={SOCIAL_BUTTON}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="ניווט תחתון">
            <h2 className="text-label font-semibold uppercase text-muted">
              סוגי אירועים
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-10">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/gallery/${service.slug}`}
                    className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-brand-deep"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* Founding year only — a fixed value, not the current year, so the
              line can never go stale between builds. */}
          <p>
            © {site.foundedYear} {site.name} · {site.owner}
          </p>
          <a
            href={telHref}
            className="inline-flex min-h-11 items-center transition-colors hover:text-brand-deep"
          >
            {site.phoneDisplay}
          </a>
        </div>
      </div>
    </footer>
  );
}
