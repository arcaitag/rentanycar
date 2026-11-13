import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building, Clock, ExternalLink, MapPin, MessageCircle, UserRound } from "lucide-react";
import { PROVIDERS, getProvider, vehiclesOf } from "@/data/providers";
import { ProviderAvatar, Stars } from "@/components/ui/Avatar";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { Rating } from "@/components/ui/Rating";
import { VehicleGrid } from "@/components/ui/VehicleGrid";

export const dynamicParams = false;
export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  return {
    title: p.kind === "privat" ? `${p.name}, Privatanbieter in ${p.city}` : `${p.name} in ${p.city}`,
    description: `${p.kind === "privat" ? "Profil einer Privatperson" : "Firmenprofil"} auf rentanycar.ch mit Fahrzeugen und Bewertungen.`,
    alternates: { canonical: `/anbieter/${p.slug}` },
  };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProvider((await params).slug);
  if (!p) notFound();
  const vehicles = vehiclesOf(p.slug);
  const reviews = vehicles.flatMap((v) => v.reviews.map((r) => ({ ...r, car: `${v.make} ${v.model}` })));
  const privat = p.kind === "privat";
  const facts = privat
    ? [
        { icon: MapPin, label: "Region", value: p.region },
        { icon: Clock, label: "Mitglied seit", value: p.since },
        { icon: MessageCircle, label: "Antwortzeit", value: p.responseTime },
        { icon: UserRound, label: "Fahrzeuge", value: `${vehicles.length} ${vehicles.length === 1 ? "Fahrzeug" : "Fahrzeuge"} im Angebot` },
      ]
    : [
        { icon: MapPin, label: "Firmenstandort", value: p.address! },
        { icon: UserRound, label: "Kontaktperson", value: p.contact! },
        { icon: MessageCircle, label: "Antwortzeit", value: p.responseTime },
        { icon: Building, label: "Standorte", value: p.locations!.join(", ") },
      ];

  return (
    <div className="page pt-8 pb-20">
      <div className={privat ? "rounded-[2rem] bg-leaf-100 p-6 sm:p-10" : "rounded-[2rem] bg-sage-100 p-6 sm:p-10"}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProviderAvatar p={p} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProviderBadge kind={p.kind} onTint />
            </div>
            <h1 className="mt-3 text-[2.2rem] leading-tight font-bold sm:text-[2.8rem]">{p.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink/80">
              <span>{privat ? p.region : `${p.legalForm}, ${p.city}`}</span>
              <Rating value={p.rating} count={p.reviewCount} />
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">{p.bio}</p>
        {privat && <p className="mt-4 text-sm text-muted">Die vollständige Adresse von Privatpersonen wird nie öffentlich angezeigt.</p>}
      </div>
      {p.locationImage && <img src={p.locationImage} alt={`Standort von ${p.name}`} className="mt-6 aspect-[3/1] w-full rounded-2xl border border-line object-cover" />}

      <div className="mt-10 grid gap-10 lg:grid-cols-[20rem_1fr]">
        <aside>
          <dl className="grid gap-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="relative pl-8">
                <dt className="text-sm font-bold text-muted">
                  <Icon className="absolute top-0.5 left-0 size-5 text-leaf-700" aria-hidden />
                  {label}
                </dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {!privat && (
            <div className="mt-8 grid gap-6">
              <div>
                <h2 className="text-xl font-bold">Öffnungszeiten</h2>
                <dl className="mt-3 grid gap-1.5 text-[0.95rem]">
                  {p.hours!.map(([d, t]) => <div key={d} className="flex justify-between gap-4 border-b border-line pb-1.5"><dt>{d}</dt><dd className="text-right font-semibold">{t}</dd></div>)}
                </dl>
              </div>
              <div>
                <h2 className="text-xl font-bold">Firmenangaben</h2>
                <dl className="mt-3 grid gap-2 text-[0.95rem]">
                  {p.uidPublic && p.uid && <div><dt className="font-bold text-muted">UID-Nummer</dt><dd>{p.uid}</dd></div>}
                  <div><dt className="font-bold text-muted">Rechtsform</dt><dd>{p.legalForm}</dd></div>
                  {p.website && (
                    <div>
                      <dt className="font-bold text-muted">Website</dt>
                      <dd><a href={p.website} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">{p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}<ExternalLink className="size-3.5" aria-hidden /></a></dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </aside>
        <div>
          <h2 className="text-2xl font-bold">{privat ? `Fahrzeug von ${p.name}` : "Fahrzeugflotte"}</h2>
          <VehicleGrid slugs={vehicles.map((v) => v.slug)} />
          <h2 className="mt-12 text-2xl font-bold">Bewertungen</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.author + r.date + r.car} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-forest">{r.author}</p>
                  <Stars value={r.rating} />
                </div>
                <p className="text-sm text-muted">{r.date}, {r.car}</p>
                <p className="mt-2 leading-relaxed text-ink/85">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
