import Link from "next/link";
import { RoadEndArt } from "@/components/illustrations/Misc";

export default function NotFound() {
  return (
    <div className="page grid place-items-center pt-10 pb-20 text-center sm:pt-16">
      <RoadEndArt className="h-auto w-full max-w-md" />
      <h1 className="mt-6 text-[2.2rem] leading-tight font-bold sm:text-[2.8rem]">Hier geht’s nicht weiter.</h1>
      <p className="lead mt-3 max-w-md">Diese Seite gibt es nicht oder nicht mehr. Vielleicht findest du dein Auto über die Suche.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/autos" className="btn btn-primary">Auto finden</Link>
        <Link href="/" className="btn btn-outline">Zur Startseite</Link>
      </div>
    </div>
  );
}
