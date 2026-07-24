import { ImageResponse } from "next/og";

export const alt = "zippily — HubSpot implementation & RevOps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share card: Deep Blue with the lowercase wordmark and
// an orange accent — brand rules allow orange here (Deep Blue background).
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0E2F4A",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: "-0.06em" }}>
          zippily
        </div>
        <div
          style={{
            marginTop: 8,
            width: 120,
            height: 8,
            backgroundColor: "#F77B23",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            marginTop: 36,
            fontSize: 40,
            letterSpacing: "-0.03em",
            color: "#83B5D1",
          }}
        >
          HubSpot implementation &amp; RevOps · Auckland, NZ
        </div>
      </div>
    ),
    size,
  );
}
