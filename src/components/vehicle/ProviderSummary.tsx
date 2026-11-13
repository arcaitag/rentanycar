import Link from "next/link";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import type { Provider } from "@/data/providers";
import { ProviderAvatar } from "@/components/ui/Avatar";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { Rating } from "@/components/ui/Rating";

export function ProviderSummary({ p }: { p: Provider }) {
  const privat = p.kind === "privat";
  return (
    <div className="panel p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <ProviderAvatar p={p} />
        <div className="min-w-0">
          <ProviderBadge kind={p.kind} />
          <p className="mt-2 font-display text-xl font-semibold text-forest">{p.name}</p>
          <Rating value={p.rating} count={p.reviewCount} className="mt-1" />
        </div>
      </div>
      <ul className="mt-5 grid gap-2 text-[0.95rem] text-ink/80">
        <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-leaf-700" aria-hidden />{privat ? p.region : p.address}</li>
        <li className="flex gap-2"><MessageCircle className="mt-0.5 size-4 shrink-0 text-leaf-700" aria-hidden />Antwortet {p.responseTime}</li>
        <li className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-leaf-700" aria-hidden />{privat ? `Mitglied seit ${p.since}` : `Auf rentanycar.ch seit ${p.since}`}</li>
      </ul>
      <Link href={`/anbieter/${p.slug}`} className="btn btn-outline btn-sm mt-5">
        {privat ? `Profil von ${p.name} ansehen` : "Firmenprofil ansehen"}
      </Link>
    </div>
  );
}
