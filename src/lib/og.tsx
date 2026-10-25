import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { CardStyle } from "@/domain/gift-card";
import { site } from "@/lib/site";

/*
 * Link-preview cards (Open Graph / iMessage / Facebook / Slack), drawn with next/og at 1200×630.
 * One template in the site's own type and palette; each page picks a visual. Satori reads WOFF fonts and
 * PNG/JPEG images only, so copies of the fonts and photos live in src/assets/og.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const C = { cream: "#f3efe6", paper: "#faf8f3", butter: "#ebe1bf", ink: "#2a221d", soft: "#463c34", muted: "#6f655b", line: "#dcd2c1" };
const ASSETS = path.join(process.cwd(), "src/assets/og");

let fontCache: Promise<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]> | null = null;
function fonts() {
  fontCache ??= Promise.all(
    (
      [
        ["Gloock", "Gloock-Regular", 400],
        ["Newsreader", "Newsreader-Medium", 500],
        ["Newsreader", "Newsreader-Regular", 400],
        ["Hanken", "HankenGrotesk-Medium", 500],
        ["Hanken", "HankenGrotesk-Regular", 400],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      weight,
      style: "normal" as const,
      data: await readFile(path.join(ASSETS, "fonts", `${file}.woff`)),
    })),
  );
  return fontCache;
}

/** An image from src/assets/og/images as a data URI. */
async function asset(file: string) {
  const data = await readFile(path.join(ASSETS, "images", file));
  return `data:image/${file.endsWith(".png") ? "png" : "jpeg"};base64,${data.toString("base64")}`;
}

const CUTOUTS = ["garden-bouquet", "harlow-brook-bunch", "little-posy", "season-of-flowers", "six-months-of-flowers"];
/** The share-card copy of a bouquet cutout (by its site path), or the Garden Bouquet if there isn't one. */
export function cutoutFor(src?: string | null) {
  const name = src?.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  return `${CUTOUTS.includes(name) ? name : "garden-bouquet"}.png`;
}

export type GiftVisual = { design: CardStyle; planName: string; recipient: string; sender: string; message: string; bouquet: string };
type Visual =
  | { kind: "hero"; bouquet: string }
  | { kind: "cutout"; bouquet: string }
  | { kind: "lineup"; bouquets: string[] }
  | { kind: "photo"; photo: string }
  | { kind: "gift"; gift: GiftVisual };

export async function shareCard(input: { kicker?: string; title: string; subtitle?: string; visual: Visual }) {
  const host = site.url.replace(/^https?:\/\//, "");
  const { visual } = input;

  if (visual.kind === "hero") return heroCard(await asset(visual.bouquet), host);

  const right = await renderVisual(visual);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.cream, color: C.ink }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: "60px 0 56px 72px" }}>
          <div style={{ display: "flex", fontFamily: "Gloock", fontSize: 38, letterSpacing: -1 }}>Harlow Brook</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {input.kicker && (
              <div style={{ display: "flex", fontFamily: "Hanken", fontWeight: 500, fontSize: 24, color: C.muted, marginBottom: 18 }}>
                {input.kicker}
              </div>
            )}
            <div style={{ display: "flex", fontFamily: "Newsreader", fontWeight: 500, fontSize: input.title.length > 44 ? 58 : 68, lineHeight: 1.04, letterSpacing: -1.5 }}>
              {input.title}
            </div>
            {input.subtitle && (
              <div style={{ display: "flex", fontFamily: "Hanken", fontSize: 26, lineHeight: 1.4, color: C.soft, marginTop: 22, maxWidth: 520 }}>
                {input.subtitle}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontFamily: "Hanken", fontWeight: 500, fontSize: 20, color: C.muted }}>
            {`Hartland, Vermont · ${host}`}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative" }}>{right}</div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}

async function renderVisual(visual: Exclude<Visual, { kind: "hero" }>) {
  if (visual.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img>
    return <img src={await asset(visual.photo)} alt="" width={560} height={630} style={{ width: 560, height: 630, objectFit: "cover" }} />;
  }
  if (visual.kind === "cutout") {
    return (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%" }}>
        <div style={{ position: "absolute", left: 70, top: 96, width: 420, height: 420, borderRadius: 999, background: C.butter }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img> */}
        <img src={await asset(visual.bouquet)} alt="" style={{ position: "absolute", left: 20, top: 40, width: 520, height: 540, objectFit: "contain", objectPosition: "bottom" }} />
      </div>
    );
  }
  if (visual.kind === "lineup") {
    const srcs = await Promise.all(visual.bouquets.map(asset));
    return (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%" }}>
        <div style={{ position: "absolute", left: 60, top: 110, width: 440, height: 440, borderRadius: 999, background: C.butter }} />
        <div style={{ display: "flex", position: "absolute", left: 0, right: 30, bottom: 50, alignItems: "flex-end", justifyContent: "center" }}>
          {srcs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img>
            <img key={i} src={src} alt="" style={{ width: [150, 200, 230][i] ?? 180, height: [220, 330, 420][i] ?? 300, objectFit: "contain", objectPosition: "bottom", marginLeft: i ? -24 : 0 }} />
          ))}
        </div>
      </div>
    );
  }
  return giftVisual(visual.gift);
}

const GIFT_DESIGNS: Record<CardStyle, { bg: string; fg: string; muted: string; rule: string }> = {
  letterpress: { bg: C.paper, fg: C.ink, muted: C.muted, rule: C.line },
  garden: { bg: C.paper, fg: C.ink, muted: C.muted, rule: C.line },
  evening: { bg: C.ink, fg: C.paper, muted: "rgba(250,248,243,0.6)", rule: "rgba(250,248,243,0.22)" },
  buttercup: { bg: C.butter, fg: C.ink, muted: "rgba(42,34,29,0.58)", rule: "rgba(42,34,29,0.16)" },
};

async function giftVisual(g: GiftVisual) {
  const d = GIFT_DESIGNS[g.design];
  const bouquet = await asset(g.bouquet);
  const message = g.message.length > 90 ? `${g.message.slice(0, 88).trimEnd()}…` : g.message;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", right: -70, top: 40, width: 360, height: 360, borderRadius: 999, background: C.butter }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img> */}
      <img src={bouquet} alt="" style={{ position: "absolute", right: -30, top: 70, width: 280, height: 340, objectFit: "contain", objectPosition: "bottom" }} />
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 86,
          width: 350,
          height: 470,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: d.bg,
          color: d.fg,
          transform: "rotate(-3deg)",
          boxShadow: "0 30px 60px -30px rgba(42,34,29,0.55)",
          padding: "0 36px",
          textAlign: "center",
        }}
      >
        <div style={{ position: "absolute", left: 12, top: 12, right: 12, bottom: 12, border: `1px solid ${d.rule}` }} />
        <div style={{ display: "flex", fontFamily: "Gloock", fontSize: 26, letterSpacing: -0.5 }}>Harlow Brook</div>
        <div style={{ display: "flex", fontFamily: "Newsreader", fontWeight: 500, fontSize: 34, marginTop: 26, lineHeight: 1.1 }}>{g.planName}</div>
        <div style={{ display: "flex", fontFamily: "Newsreader", fontWeight: 500, fontSize: 30, marginTop: 30 }}>{`For ${g.recipient}`}</div>
        {message && (
          <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 22, lineHeight: 1.4, color: d.muted, marginTop: 14 }}>
            {`“${message}”`}
          </div>
        )}
        <div style={{ display: "flex", fontFamily: "Newsreader", fontWeight: 500, fontSize: 24, marginTop: 18 }}>{`With love, ${g.sender}`}</div>
      </div>
    </div>
  );
}

/** The homepage card: the giant wordmark behind a bouquet on its butter circle, as in the hero. */
async function heroCard(bouquet: string, host: string) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: C.cream, color: C.ink }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 54, display: "flex", justifyContent: "center", fontFamily: "Gloock", fontSize: 172, letterSpacing: -6, whiteSpace: "nowrap" }}>
          Harlow Brook
        </div>
        <div style={{ position: "absolute", left: 440, top: 140, width: 320, height: 320, borderRadius: 999, background: C.butter }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img> */}
        <img src={bouquet} alt="" style={{ position: "absolute", left: 410, top: 112, width: 380, height: 420, objectFit: "contain", objectPosition: "bottom" }} />
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 48, display: "flex", justifyContent: "space-between", fontFamily: "Hanken", fontWeight: 500, fontSize: 24, color: C.soft }}>
          <div style={{ display: "flex" }}>Seasonal flowers from a family farm in Hartland, Vermont</div>
          <div style={{ display: "flex", color: C.muted }}>{host}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}
