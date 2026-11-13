"use client";
import { useRouter } from "next/navigation";
import { ProviderToggle } from "@/components/ui/ProviderToggle";
import { SearchForm } from "@/components/search/SearchForm";
import { DEFAULT_CRITERIA, serializeCriteria } from "@/lib/search";
import { useHomeFilter } from "./HomeFilter";

export default function HeroSearch() {
  const router = useRouter();
  const [anbieter, setAnbieter] = useHomeFilter();
  return (
    <SearchForm
      className="shadow-[var(--shadow-float)]"
      top={<ProviderToggle value={anbieter} onChange={setAnbieter} label="Wer vermietet das Fahrzeug?" className="mb-4" />}
      onSearch={(v) =>
        router.push(
          `/autos?${serializeCriteria({ ...DEFAULT_CRITERIA, ort: v.ort.trim(), von: v.fd ? `${v.fd}T${v.ft || "10:00"}` : "", bis: v.td ? `${v.td}T${v.tt || "10:00"}` : "", anbieter })}`,
        )
      }
    />
  );
}
