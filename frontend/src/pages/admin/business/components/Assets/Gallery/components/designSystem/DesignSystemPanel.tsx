import React from "react";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Type, AlignLeft, List, RectangleHorizontal, Palette } from "lucide-react";
import { TDesignSystem } from "../../../../../../../../models/DesignSystem";
import { Fonts } from "../../../../../../../../const/Fonts";

type Props = {
  draft: TDesignSystem;
  original: TDesignSystem;
  activeElement: string | null;
  onActiveElementChange: (el: string | null) => void;
  onDraftChange: (draft: TDesignSystem) => void;
  onSave: (data: Partial<TDesignSystem>) => void;
  onDelete?: () => void;
};

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-left text-slate-600 flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0" />
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-[72px] text-[11px] px-1.5 py-0.5 border border-slate-200 rounded font-mono" />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-left text-slate-600 flex-1">{label}</label>
      <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-[100px] text-[11px] px-1.5 py-0.5 border border-slate-200 rounded" />
    </div>
  );
}

function FontFamilySelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const options = Fonts.includes(value) ? Fonts : [value, ...Fonts];
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-left text-slate-600 flex-1">{label}</label>
      <select
        value={value || Fonts[0]}
        onChange={(e) => onChange(e.target.value)}
        className="w-[160px] text-[11px] px-1.5 py-0.5 border border-slate-200 rounded bg-white"
      >
        {options.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}{!Fonts.includes(font) ? " (custom)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-left text-slate-600 flex-1">{label}</label>
      <select value={value || options[0]} onChange={(e) => onChange(e.target.value)} className="w-[100px] text-[11px] px-1.5 py-0.5 border border-slate-200 rounded bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-2 mb-1">{children}</p>;
}

const TABS = [
  { id: null, label: "canvas", icon: Palette },
  { id: "headline", label: "headline", icon: Type },
  { id: "subheadline", label: "subtitle_tab", icon: Type },
  { id: "description", label: "text", icon: AlignLeft },
  { id: "list", label: "list", icon: List },
  { id: "button", label: "button", icon: RectangleHorizontal },
] as const;

function DesignSystemPanel({ draft, original, activeElement, onActiveElementChange, onDraftChange, onSave, onDelete }: Props) {
  const { t } = useTranslation();
  const isPreset = original.isPreset;
  const { name: _dn, ...draftFields } = draft;
  const { name: _on, ...originalFields } = original;
  const hasChanges = JSON.stringify(draftFields) !== JSON.stringify(originalFields);

  const updateColor = (key: string, value: string) => {
    onDraftChange({ ...draft, colors: { ...draft.colors, [key]: value } });
  };

  const updateTypography = (level: string, key: string, value: string | number) => {
    onDraftChange({
      ...draft,
      typography: { ...draft.typography, [level]: { ...(draft.typography as any)[level], [key]: value } },
    });
  };

  const updateDraft = (partial: Partial<TDesignSystem>) => {
    onDraftChange({ ...draft, ...partial });
  };

  const renderTypoFields = (level: string) => {
    const typo = (draft.typography as any)?.[level];
    if (!typo) return null;
    return (
      <>
        <SectionLabel>{t('DesignSystem.font')}</SectionLabel>
        <FontFamilySelect label={t('DesignSystem.family')} value={typo.fontFamily} onChange={(v) => updateTypography(level, "fontFamily", v)} />
        <TextInput label={t('DesignSystem.weight')} value={typo.weight} onChange={(v) => updateTypography(level, "weight", Number(v) || v)} />
        <SelectInput label={t('DesignSystem.case')} value={typo.case} options={["uppercase", "lowercase", "title", "sentence"]} onChange={(v) => updateTypography(level, "case", v)} />
        <TextInput label={t('DesignSystem.sizePercent')} value={typo.sizePercent} onChange={(v) => updateTypography(level, "sizePercent", Number(v) || 0)} />
        <SectionLabel>{t('DesignSystem.spacing')}</SectionLabel>
        <TextInput label={t('DesignSystem.letterSpacing')} value={typo.letterSpacing} onChange={(v) => updateTypography(level, "letterSpacing", v)} />
        <TextInput label={t('DesignSystem.lineHeight')} value={typo.lineHeight} onChange={(v) => updateTypography(level, "lineHeight", Number(v) || 0)} />
      </>
    );
  };

  const renderFields = () => {
    switch (activeElement) {
      case "headline":
        return (
          <>
            <SectionLabel>{t('DesignSystem.colors')}</SectionLabel>
            <ColorInput label={t('DesignSystem.word1')} value={draft.colors.primary} onChange={(v) => updateColor("primary", v)} />
            <ColorInput label={t('DesignSystem.word2')} value={draft.colors.foreground} onChange={(v) => updateColor("foreground", v)} />
            {renderTypoFields("headline")}
          </>
        );
      case "subheadline":
        return (
          <>
            <SectionLabel>{t('DesignSystem.colors')}</SectionLabel>
            <ColorInput label={t('DesignSystem.word1')} value={draft.colors.accentForeground} onChange={(v) => updateColor("accentForeground", v)} />
            <ColorInput label={t('DesignSystem.word2')} value={draft.colors.mutedForeground} onChange={(v) => updateColor("mutedForeground", v)} />
            {renderTypoFields("subheadline")}
          </>
        );
      case "description":
        return (
          <>
            <SectionLabel>{t('DesignSystem.color')}</SectionLabel>
            <ColorInput label={t('DesignSystem.textColor')} value={draft.colors.secondary} onChange={(v) => updateColor("secondary", v)} />
            {renderTypoFields("body")}
          </>
        );
      case "button":
        return (
          <>
            <SectionLabel>{t('DesignSystem.colors')}</SectionLabel>
            <ColorInput label={t('DesignSystem.background')} value={draft.colors.border} onChange={(v) => updateColor("border", v)} />
            <ColorInput label={t('DesignSystem.textColor')} value={draft.colors.primaryForeground} onChange={(v) => updateColor("primaryForeground", v)} />
            {renderTypoFields("cta")}
            <SectionLabel>{t('DesignSystem.shape')}</SectionLabel>
            <TextInput label={t('DesignSystem.radius')} value={draft.radius} onChange={(v) => updateDraft({ radius: v })} />
            <TextInput label={t('DesignSystem.shadowBlur')} value={draft.shadow?.blur || ""} onChange={(v) => updateDraft({ shadow: { ...draft.shadow, blur: v } })} />
            <ColorInput label={t('DesignSystem.shadowColor')} value={draft.shadow?.color?.startsWith("rgba") ? "#000000" : (draft.shadow?.color || "#000000")} onChange={(v) => updateDraft({ shadow: { ...draft.shadow, color: v } })} />
          </>
        );
      case "list":
        return (
          <>
            <SectionLabel>{t('DesignSystem.colors')}</SectionLabel>
            <ColorInput label={t('DesignSystem.background')} value={draft.colors.muted} onChange={(v) => updateColor("muted", v)} />
            <ColorInput label={t('DesignSystem.textColor')} value={draft.colors.secondaryForeground} onChange={(v) => updateColor("secondaryForeground", v)} />
            <ColorInput label={t('DesignSystem.bullet')} value={draft.colors.destructive} onChange={(v) => updateColor("destructive", v)} />
            <SectionLabel>{t('DesignSystem.shape')}</SectionLabel>
            <TextInput label={t('DesignSystem.radius')} value={draft.radius} onChange={(v) => updateDraft({ radius: v })} />
          </>
        );
      default:
        return (
          <>
            <SectionLabel>{t('DesignSystem.background')}</SectionLabel>
            <ColorInput label={t('DesignSystem.color')} value={draft.colors.background} onChange={(v) => updateColor("background", v)} />
            <ColorInput label={t('DesignSystem.accentLine')} value={draft.colors.accent} onChange={(v) => updateColor("accent", v)} />
            <SectionLabel>{t('DesignSystem.layout')}</SectionLabel>
            <TextInput label={t('DesignSystem.padding')} value={draft.spacing?.contentPadding || "32px"} onChange={(v) => updateDraft({ spacing: { ...draft.spacing, contentPadding: v } })} />
            <TextInput label={t('DesignSystem.radius')} value={draft.radius} onChange={(v) => updateDraft({ radius: v })} />
          </>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-slate-100">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeElement === tab.id;
          return (
            <button
              key={tab.label}
              onClick={() => onActiveElementChange(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon size={12} />
              {t(`DesignSystem.${tab.label}`)}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {renderFields()}
      </div>

      {/* Footer */}
      {!isPreset && (
        <div className="px-3 py-2.5 border-t border-slate-200 flex items-center justify-between">
          {onDelete ? (
            <button onClick={onDelete} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
              <Trash2 size={12} /> {t('DesignSystem.delete')}
            </button>
          ) : <div />}
          <button
            onClick={() => hasChanges && onSave(draft)}
            disabled={!hasChanges}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              hasChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save size={12} /> {t('DesignSystem.save')}
          </button>
        </div>
      )}
    </div>
  );
}

export default DesignSystemPanel;
