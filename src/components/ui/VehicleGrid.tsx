"use client";
import { useEffect, useState } from "react";
import { getVehicle, type Vehicle } from "@/data/vehicles";
import { PENDING, availabilityOf } from "@/lib/availability";
import { startOfDay } from "@/lib/format";
import { cn } from "@/lib/cn";
import { VehicleCard } from "./VehicleCard";

/** Heutiges Datum erst im Browser bestimmen (statisch erzeugte Seiten kennen es nicht). */
export function useToday() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(startOfDay(new Date())), []);
  return today;
}

/** Fahrzeugliste mit Verfügbarkeit – auch für statische Seiten verwendbar. */
export function VehicleGrid({ slugs, className }: { slugs: string[]; className?: string }) {
  const today = useToday();
  const list = slugs.map(getVehicle).filter((v): v is Vehicle => !!v);
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {list.map((v, i) => (
        <li key={v.slug}>
          <VehicleCard v={v} availability={today ? availabilityOf(v, today) : PENDING} eager={i < 3} />
        </li>
      ))}
    </ul>
  );
}
