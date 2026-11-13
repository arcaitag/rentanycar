"use client";
import Link from "next/link";
import { BookingKmPanel } from "@/components/mileage/BookingKm";
import { getVehicle, vehicleImage, vehicleTitle } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import { STATUS_LABEL, type BookingRecord, type BookingStatus } from "@/data/account";
import { chf, fmtDate, fmtTime } from "@/lib/format";
import { fmtKm } from "@/lib/mileage";
import { fmtMonths, offerLabel } from "@/lib/offers";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const tone = { angefragt: "bg-sun/25 text-[#5c4611]", bestaetigt: "bg-leaf-100 text-leaf-700", abgeschlossen: "bg-line/70 text-ink/75", abgelehnt: "bg-alert/10 text-alert" }[status];
  return <span className={cn("chip", tone)}>{STATUS_LABEL[status]}</span>;
}

export function BookingItem({ b, children, role }: { b: BookingRecord; children?: React.ReactNode; role: "mieter" | "vermieter" }) {
  const v = getVehicle(b.vehicleSlug);
  if (!v) return null;
  const from = new Date(b.from), to = new Date(b.to);
  return (
    <li className="min-w-0 rounded-2xl bg-white p-4 ring-1 ring-line">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img src={vehicleImage(v)} alt="" width={160} height={104} className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-32" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge kind={providerOf(v).kind} />
            <StatusBadge status={b.status} />
          </div>
          <p className="mt-1.5 font-bold text-forest"><Link href={`/autos/${v.slug}`} className="hover:underline">{vehicleTitle(v)}</Link></p>
          <p className="text-sm text-muted">
            {b.plan ? `${offerLabel(b.plan.model)} ab ${fmtDate(from, true)} · ${b.plan.model === "abo" ? "Laufzeit " : ""}${fmtMonths(b.plan.months)} · ${fmtKm(b.plan.kmPerMonth)} pro Monat` : <>{fmtDate(from, true)}, {fmtTime(from)} bis {fmtDate(to, true)}, {fmtTime(to)}</>}
          </p>
          <p className="text-sm text-muted">{role === "mieter" ? `Anbieter: ${b.counterpart}` : `Anfrage von ${b.counterpart}`}</p>
        </div>
        {/* Auf dem Handy rutschen die Schaltflächen bei Bedarf unter den Preis, damit er nicht umbricht */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 sm:flex-col sm:flex-nowrap sm:items-end">
          {/* Langzeitmiete und Auto-Abo: Preis pro Monat statt Total über die Laufzeit */}
          <p className="leading-tight whitespace-nowrap sm:text-right">
            <span className="block font-display text-lg font-bold text-forest">{chf(b.plan ? b.plan.monthly : b.total)}</span>
            <span className="block text-xs text-muted">{b.plan ? "pro Monat" : "Total"}</span>
          </p>
          {children}
        </div>
      </div>
      {b.km && <BookingKmPanel b={b} role={role} />}
    </li>
  );
}

export function Empty({ title, text, href, cta }: { title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line">
      <p className="font-display text-xl font-semibold text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-ink/75">{text}</p>
      {href && <Link href={href} className="btn btn-primary mt-5">{cta}</Link>}
    </div>
  );
}

export function BarChart({ data, label, format = (n: number) => chf(n) }: { data: { label: string; value: number }[]; label: string; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <figure>
      <div className="flex h-40 items-end gap-1.5 sm:gap-2.5" role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`}>
        {data.map((d, i) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end">
            <div className={cn("rounded-t-md transition-[height] duration-300", i === data.length - 1 ? "bg-leaf-500" : "bg-leaf-200")} style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }} title={`${d.label}: ${format(d.value)}`} />
          </div>
        ))}
      </div>
      {/* Gleiche Spalten wie die Balken; Beschriftungen dürfen mittig in die Nachbarspalte ragen (auf dem Handy ist jede zweite ausgeblendet) */}
      <div className="mt-2 grid gap-1.5 text-[0.68rem] font-semibold text-muted sm:gap-2.5 sm:text-xs" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }} aria-hidden>
        {data.map((d, i) => <span key={d.label} className={cn("flex justify-center whitespace-nowrap", data.length > 8 && i % 2 === 1 && "invisible sm:visible")}>{d.label}</span>)}
      </div>
    </figure>
  );
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 font-display text-[1.7rem] font-bold text-forest">{value}</p>
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  );
}
