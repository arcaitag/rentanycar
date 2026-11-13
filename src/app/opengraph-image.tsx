import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "rentanycar.ch – Das passende Auto. Direkt in deiner Nähe.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SYMBOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="17" fill="#174B38"/><path d="M18.5 47V31.5C18.5 24.6 24.1 19 31 19H32" fill="none" stroke="#79D99F" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="45" cy="19" r="6" fill="#fff"/></svg>`;
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

export default async function OpengraphImage() {
  const dir = join(process.cwd(), "node_modules/@fontsource/manrope/files");
  const [bold, medium, car] = await Promise.all([
    readFile(join(dir, "manrope-latin-800-normal.woff")),
    readFile(join(dir, "manrope-latin-500-normal.woff")),
    readFile(join(process.cwd(), "public/illustrationen/auto-gruen.svg"), "utf8").catch(() => ""),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F8FFF9", padding: "64px 72px", fontFamily: "Manrope", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -80, width: 700, height: 560, borderRadius: 400, background: "#E7F8ED", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={uri(SYMBOL)} width={76} height={76} alt="" />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#174B38" }}>rentany</span>
            <span style={{ color: "#38A96B" }}>car.ch</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 70, fontWeight: 800, color: "#174B38", lineHeight: 1.04, letterSpacing: -2 }}><span>Das passende Auto.</span><span>Direkt in deiner Nähe.</span></div>
          <div style={{ fontSize: 30, fontWeight: 500, color: "#17251F", marginTop: 24 }}>Autos von Privatpersonen und Unternehmen – in der ganzen Schweiz.</div>
        </div>
        {car && <img src={uri(car)} width={430} height={151} alt="" style={{ position: "absolute", right: 60, bottom: 70 }} />}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: bold, weight: 800, style: "normal" },
        { name: "Manrope", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
