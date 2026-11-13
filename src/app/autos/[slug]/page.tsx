import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Check, Cog, DoorOpen, Fuel, Gauge, Info, KeyRound, MapPin, Users } from "lucide-react";
import { VEHICLES, categoryLabel, getVehicle, vehicleImageLarge, vehicleImages, vehicleTitle } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import { project } from "@/data/places";
import { chf } from "@/lib/format";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { Rating } from "@/components/ui/Rating";
import { Stars } from "@/components/ui/Avatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Gallery } from "@/components/vehicle/Gallery";
import { AvailabilityCalendar } from "@/components/vehicle/AvailabilityCalendar";
import { BookingProvider, BookingWidget, MobileBookingBar, SafetyNote } from "@/components/vehicle/Booking";
import { ProviderSummary } from "@/components/vehicle/ProviderSummary";
import { SwissMap } from "@/components/search/SwissMap";
import { MileageInfo } from "@/components/mileage/MileageInfo";
import { fmtKm } from "@/lib/mileage";
import { offersOf, priceTag } from "@/lib/offers";
import { OfferDetails } from "@/components/offers/OfferDetails";

export const dynamicParams = false;
export function generateStaticParams() {
  return VEHICLES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = getVehicle((await params).slug);
  if (!v) return {};
  const p = providerOf(v);
  const title = `${vehicleTitle(v)} in ${v.city} mieten`;
  return {
    title,
    description: `${vehicleTitle(v)} ${p.kind === "privat" ? "von einer Privatperson" : `von ${p.name}`} in ${v.city} mieten: ${priceTag(v).from ? "ab " : ""}${chf(priceTag(v).amount)} pro ${priceTag(v).unit}, ${v.gear}, ${v.fuel}, ${v.seats} Sitzplätze.`,
    alternates: { canonical: `/autos/${v.slug}` },
    openGraph: { title, images: [{ url: vehicleImageLarge(v), alt: vehicleTitle(v) }] },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-8">
      <h2 id={id} className="text-[1.4rem] font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const v = getVehicle((await params).slug);
  if (!v) notFound();
  const p = providerOf(v);
  const title = vehicleTitle(v);
  const { images, placeholder, credit } = vehicleImages(v);
  const [mx, my] = project(v.lat, v.lng);
  const o = offersOf(v);
  const short = o.models.includes("kurzzeit");
  // Inklusive Kilometer: pro Tag bei Kurzzeitmiete, sonst pro Monat
  const included = short ? `${fmtKm(v.mileage.perDay)} pro Tag` : `${fmtKm(o.long?.kmPerMonth ?? o.abo?.packages[0].km ?? 0)} pro Monat`;
  const specs = [
    { icon: Cog, label: "Getriebe", value: v.gear },
    { icon: Fuel, label: "Antrieb", value: v.fuel },
    { icon: Users, label: "Sitzplätze", value: String(v.seats) },
    { icon: DoorOpen, label: "Türen", value: String(v.doors) },
    { icon: CalendarClock, label: "Baujahr", value: String(v.year) },
    { icon: Gauge, label: "Inklusive", value: included },
  ];

  return (
    <BookingProvider v={v} providerName={p.name} providerKind={p.kind}>
      <div className="page pt-4 pb-28 lg:pb-16">
        <nav aria-label="Brotkrumen" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/autos" className="hover:text-forest hover:underline">Auto finden</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/autos?ort=${encodeURIComponent(v.city)}&anbieter=alle`} className="hover:text-forest hover:underline">{v.city}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{title}</li>
          </ol>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ProviderBadge kind={p.kind} />
                  <span className="chip bg-white text-ink/80 ring-1 ring-line">{categoryLabel(v.categories[0])}</span>
                  {v.contactless && <span className="chip bg-white text-forest ring-1 ring-line"><KeyRound className="size-3.5" aria-hidden />Kontaktlose Übergabe</span>}
                </div>
                <h1 className="mt-2 text-[1.9rem] leading-tight font-bold sm:text-[2.3rem]">{title}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-ink/80">
                  <Rating value={v.rating} count={v.reviewCount} />
                  <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-leaf-700" aria-hidden />{v.city}, {v.area}</span>
                  <span>
                    {p.kind === "gewerbe" ? "Angeboten von " : "Vermietet von "}
                    <Link href={`/anbieter/${p.slug}`} className="link">{p.name}</Link>
                  </span>
                </p>
              </div>
              <FavoriteButton slug={v.slug} label={title} className="mt-1 shrink-0" />
            </div>

            <div className="mt-5">
              <Gallery title={title} images={images} placeholder={placeholder} credit={credit} />
            </div>

            <div className="mt-6 grid gap-4 lg:hidden">
              <BookingWidget idp="m" />
              <SafetyNote />
            </div>

            <div className="mt-6">
              <Section id="daten" title="Das Wichtigste">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="relative rounded-xl border border-line bg-white py-3 pr-3 pl-11">
                      <dt className="text-xs font-bold text-muted">
                        <Icon className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-leaf-700" aria-hidden />
                        {label}
                      </dt>
                      <dd className="font-semibold text-forest">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-muted">Kategorie: {v.categories.map(categoryLabel).join(", ")}</p>
              </Section>
              {(o.models.length > 1 || !short || o.short) && (
                <Section id="mietmodelle" title={o.models.length > 1 || !short ? "Mietmodelle" : "Konditionen"}>
                  <OfferDetails v={v} />
                </Section>
              )}
              <Section id="beschreibung" title="Beschreibung">
                <p className="max-w-[65ch] text-[1.02rem] leading-relaxed text-ink/85">{v.description}</p>
              </Section>
              <Section id="ausstattung" title="Ausstattung">
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {v.features.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />{f}</li>)}
                </ul>
              </Section>
              {short && (
                <Section id="kilometer" title={o.models.length > 1 ? "Kilometer bei Kurzzeitmiete" : "Kilometer"}>
                  <MileageInfo p={v.mileage} />
                </Section>
              )}
              <Section id="regeln" title="Regeln des Anbieters">
                <ul className="grid gap-2.5">
                  {v.rules.map((r) => <li key={r} className="flex gap-2.5"><Info className="mt-0.5 size-5 shrink-0 text-leaf-700" aria-hidden />{r}</li>)}
                </ul>
              </Section>
              {short && (
                <Section id="verfuegbarkeit" title="Verfügbarkeit">
                  <p className="mb-4 max-w-[65ch] text-ink/75">Wähle Abholung und Rückgabe direkt im Kalender. Belegte Tage sind durchgestrichen.</p>
                  <div className="max-w-2xl"><AvailabilityCalendar /></div>
                </Section>
              )}
              <Section id="abholort" title="Abholort und Übergabe">
                <div className="grid gap-5 sm:grid-cols-[1fr_15rem] sm:items-start">
                  <div>
                    <p className="font-semibold text-forest">{v.pickup}</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-ink/80"><KeyRound className="size-4 text-leaf-700" aria-hidden />{v.handover}</p>
                    {p.kind === "privat" && <p className="hint">Bei Privatpersonen zeigen wir aus Datenschutzgründen nur die ungefähre Lage.</p>}
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-line">
                    <SwissMap className="block h-auto w-full">
                      {p.kind === "privat" ? <circle cx={mx} cy={my} r="26" fill="#38A96B" opacity=".25" stroke="#38A96B" strokeWidth="2" /> : null}
                      <circle cx={mx} cy={my} r="9" fill="#174B38" stroke="#fff" strokeWidth="3" />
                    </SwissMap>
                  </div>
                </div>
              </Section>
              <Section id="anbieter" title={p.kind === "privat" ? "Wer vermietet" : "Anbieter"}>
                <div className="max-w-md"><ProviderSummary p={p} /></div>
              </Section>
              <Section id="bewertungen" title="Bewertungen">
                <ul className="grid gap-4">
                  {v.reviews.map((r) => (
                    <li key={r.author + r.date} className="card p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-forest">{r.author}</p>
                        <p className="text-sm text-muted">{r.date}</p>
                      </div>
                      <Stars value={r.rating} />
                      <p className="mt-2 max-w-[70ch] leading-relaxed text-ink/85">{r.text}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          </div>
          <aside className="hidden lg:block" aria-label="Buchung">
            <div className="grid gap-4 [@media(min-height:880px)]:sticky [@media(min-height:880px)]:top-20">
              <BookingWidget />
              <SafetyNote />
            </div>
          </aside>
        </div>
      </div>
      <MobileBookingBar />
    </BookingProvider>
  );
}
