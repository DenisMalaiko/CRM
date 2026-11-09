import React from "react";
import { Copy, Lock } from "lucide-react";
import { TDesignSystem } from "../../../../../../../../models/DesignSystem";

interface Props {
  designSystem: TDesignSystem;
  isSelected: boolean;
  onClick: () => void;
  onDuplicate?: () => void;
}

function DesignSystemCard({ designSystem, isSelected, onClick, onDuplicate }: Props) {
  const { colors, name, isPreset, typography } = designSystem;

  const colorSwatches = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.muted,
  ];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-blue-500 shadow-md bg-blue-50/50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* Color preview */}
      <div
        className="h-24 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        {/* Diagonal accent stripe */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, transparent 50%, ${colors.secondary} 100%)`,
          }}
        />

        {/* Color dots */}
        <div className="flex gap-2 z-10">
          {colorSwatches.map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Sample text preview */}
        <div
          className="absolute bottom-2 left-3 text-[10px] font-bold tracking-wide opacity-70"
          style={{ color: colors.foreground }}
        >
          {typography?.headline?.fontFamily || "Sans-serif"} · {typography?.headline?.weight || 700}
        </div>
      </div>

      {/* Name & meta */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {designSystem.radius} radius · {typography?.headline?.fontFamily || "—"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {isPreset && (
            <span className="text-xs text-slate-400" title="Preset template">
              <Lock size={14} />
            </span>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
              title="Duplicate to customize"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DesignSystemCard;