import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SYMBOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#174B38"/><path d="M18.5 47V31.5C18.5 24.6 24.1 19 31 19H32" fill="none" stroke="#79D99F" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="45" cy="19" r="6" fill="#fff"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={`data:image/svg+xml;base64,${Buffer.from(SYMBOL).toString("base64")}`} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
