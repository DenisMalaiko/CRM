import React from "react";
import { TDesignSystem } from "../../../../../../../../models/DesignSystem";

interface Props {
  designSystem: TDesignSystem;
  activeElement: string | null;
  onSelectElement: (element: string | null) => void;
}

function ElementWrapper({
  id,
  isActive,
  onClick,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`cursor-pointer transition-all relative ${
        isActive
          ? "ring-2 ring-blue-500 ring-offset-2 rounded-md"
          : "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 rounded-md"
      }`}
    >
      {children}
    </div>
  );
}

// sizePercent → actual px for the canvas (500px tall)
const sz = (pct: number | undefined, fallback: number) => `${(pct || fallback) * 3.2}px`;

function DesignSystemPreview({ designSystem, activeElement, onSelectElement }: Props) {
  const { colors, typography, radius, shadow, spacing } = designSystem;

  const headline = typography?.headline;
  const subheadline = typography?.subheadline;
  const body = typography?.body;
  const cta = typography?.cta;

  const shadowStyle = shadow?.blur
    ? `${shadow.offsetX || "0px"} ${shadow.offsetY || "4px"} ${shadow.blur} ${shadow.spread || "0px"} ${shadow.color || "rgba(0,0,0,0.1)"}`
    : "none";

  return (
    <div
      className="w-[420px] relative overflow-hidden flex flex-col"
      style={{
        backgroundColor: colors.background,
        borderRadius: radius || "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        padding: spacing?.contentPadding || "32px",
        minHeight: "540px",
      }}
      onClick={() => onSelectElement(null)}
    >
      {/* Decorative top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: colors.primary }}
      />

      <div className="flex flex-col justify-between h-full pt-4">
        {/* Top section */}
        <div>
          {/* Headline */}
          <ElementWrapper id="headline" isActive={activeElement === "headline"} onClick={() => onSelectElement("headline")}>
            <h1 style={{
              fontFamily: headline?.fontFamily || "sans-serif",
              fontWeight: headline?.weight || 700,
              textTransform: (headline?.case === "uppercase" ? "uppercase" : headline?.case === "title" ? "capitalize" : "none") as any,
              letterSpacing: headline?.letterSpacing || "0em",
              lineHeight: headline?.lineHeight || 1.1,
              fontSize: sz(headline?.sizePercent, 10),
              margin: 0,
            }}>
              <span style={{ color: colors.primary }}>Summer </span>
              <span style={{ color: colors.foreground }}>Collection</span>
            </h1>
          </ElementWrapper>

          {/* Subheadline */}
          <div className="mt-4">
            <ElementWrapper id="subheadline" isActive={activeElement === "subheadline"} onClick={() => onSelectElement("subheadline")}>
              <h2 style={{
                fontFamily: subheadline?.fontFamily || "sans-serif",
                fontWeight: subheadline?.weight || 400,
                textTransform: (subheadline?.case === "uppercase" ? "uppercase" : subheadline?.case === "title" ? "capitalize" : "none") as any,
                letterSpacing: subheadline?.letterSpacing || "0em",
                lineHeight: subheadline?.lineHeight || 1.3,
                fontSize: sz(subheadline?.sizePercent, 5),
                margin: 0,
              }}>
                <span style={{ color: colors.accentForeground }}>New Arrivals </span>
                <span style={{ color: colors.mutedForeground }}>This Season</span>
              </h2>
            </ElementWrapper>
          </div>

          {/* Description */}
          <div className="mt-5">
            <ElementWrapper id="description" isActive={activeElement === "description"} onClick={() => onSelectElement("description")}>
              <p style={{
                color: colors.foreground,
                fontFamily: body?.fontFamily || "sans-serif",
                fontWeight: body?.weight || 400,
                lineHeight: body?.lineHeight || 1.6,
                letterSpacing: body?.letterSpacing || "0em",
                fontSize: sz(body?.sizePercent, 3.5),
                margin: 0,
                opacity: 0.85,
              }}>
                Discover our latest pieces crafted with premium materials. Each item is designed for comfort and style that lasts beyond the season.
              </p>
            </ElementWrapper>
          </div>
        </div>

        {/* Middle: List */}
        <div className="my-6">
          <ElementWrapper id="list" isActive={activeElement === "list"} onClick={() => onSelectElement("list")}>
            <div className="flex flex-col gap-2.5">
              {["Premium quality materials", "Free shipping over $50", "30-day easy returns"].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    backgroundColor: colors.muted,
                    borderRadius: `calc(${radius || "12px"} / 2)`,
                    padding: "12px 16px",
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span style={{
                    color: colors.foreground,
                    fontFamily: body?.fontFamily || "sans-serif",
                    fontWeight: body?.weight || 400,
                    fontSize: sz(body?.sizePercent, 3.5),
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </ElementWrapper>
        </div>

        {/* Bottom: Button */}
        <div>
          <ElementWrapper id="button" isActive={activeElement === "button"} onClick={() => onSelectElement("button")}>
            <button style={{
              width: "100%",
              backgroundColor: colors.primary,
              color: colors.primaryForeground,
              fontFamily: cta?.fontFamily || "sans-serif",
              fontWeight: cta?.weight || 600,
              textTransform: (cta?.case === "uppercase" ? "uppercase" : "none") as any,
              letterSpacing: cta?.letterSpacing || "0.05em",
              fontSize: sz(cta?.sizePercent, 4),
              lineHeight: cta?.lineHeight || 1.2,
              padding: "16px 28px",
              borderRadius: radius || "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: shadowStyle,
            }}>
              Shop Now
            </button>
          </ElementWrapper>
        </div>
      </div>
    </div>
  );
}

export default DesignSystemPreview;
