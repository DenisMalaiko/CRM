import { useEffect } from "react";
import { GOOGLE_FONTS, GOOGLE_FONTS_CONFIG } from "../const/Fonts";

const googleFontsSet = new Set(GOOGLE_FONTS);
const loadedFonts = new Set<string>();

function buildGoogleFontsUrl(families: string[]): string {
  const params = families
    .map((f) => {
      const weights = GOOGLE_FONTS_CONFIG[f] || "wght@400;700";
      return `family=${f.replace(/ /g, "+")}:${weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function loadFonts(families: string[]) {
  const toLoad = families.filter((f) => googleFontsSet.has(f) && !loadedFonts.has(f));
  if (toLoad.length === 0) return;

  toLoad.forEach((f) => loadedFonts.add(f));

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = buildGoogleFontsUrl(toLoad);
  document.head.appendChild(link);
}

export function useGoogleFonts(families: string[]) {
  const key = families.filter(Boolean).sort().join(",");

  useEffect(() => {
    if (!key) return;
    loadFonts(key.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
