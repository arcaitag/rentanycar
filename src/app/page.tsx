import type { Metadata } from "next";
import { HomeFilterProvider } from "@/components/home/HomeFilter";
import PopularVehicles from "@/components/home/PopularVehicles";
import { Durations } from "@/components/home/Durations";
import { Categories, FaqSection, Hero, HowItWorks, RentOut, Safety } from "@/components/home/Sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <HomeFilterProvider>
      <Hero />
      <Durations />
      <Categories />
      <PopularVehicles />
      <HowItWorks />
      <Safety />
      <RentOut />
      <FaqSection />
    </HomeFilterProvider>
  );
}
