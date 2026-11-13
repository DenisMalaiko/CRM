import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Pencil, Check, Upload } from "lucide-react";
import { showError } from "../../../../../../utils/showError";
import { confirm } from "../../../../../../components/confirmDlg/ConfirmDlg";
import { GOOGLE_FONTS } from "../../../../../../const/Fonts";
import { useGoogleFonts } from "../../../../../../hooks/useGoogleFonts";

// Redux
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import {
  useLazyGetDesignSystemPresetsQuery,
  useLazyGetBusinessDesignSystemsQuery,
  useDuplicateDesignSystemMutation,
  useUpdateDesignSystemMutation,
  useDeleteDesignSystemMutation,
} from "../../../../../../store/designSystem/designSystemApi";
import {
  setPresets,
  setBusinessSystems,
  setSelected,
  closePanel,
  addBusinessSystem,
  updateBusinessSystem,
  removeBusinessSystem,
  setActiveSystem,
} from "../../../../../../store/designSystem/designSystemSlice";

// Components
import DesignSystemCard from "./components/designSystem/DesignSystemCard";
import DesignSystemPanel from "./components/designSystem/DesignSystemPanel";
import DesignSystemPreview from "./components/designSystem/DesignSystemPreview";
import UploadDesignSystemDlg from "./components/designSystem/UploadDesignSystemDlg";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TDesignSystem } from "../../../../../../models/DesignSystem";

function DesignSystem() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [getPresets] = useLazyGetDesignSystemPresetsQuery();
  const [getBusinessSystems] = useLazyGetBusinessDesignSystemsQuery();
  const [duplicateSystem] = useDuplicateDesignSystemMutation();
  const [updateSystem] = useUpdateDesignSystemMutation();
  const [deleteSystem] = useDeleteDesignSystemMutation();

  const { presets, businessSystems, selected, panelOpen } = useAppSelector(
    (state) => state.designSystemModule
  );

  const [draft, setDraft] = useState<TDesignSystem | null>(null);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [uploadDlgOpen, setUploadDlgOpen] = useState(false);

  useGoogleFonts(GOOGLE_FONTS);

  // Sync draft with selected
  useEffect(() => {
    if (selected) {
      setDraft({ ...selected });
    } else {
      setDraft(null);
    }
  }, [selected]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const presetsRes: ApiResponse<TDesignSystem[]> = await getPresets().unwrap();
        if (presetsRes?.data) dispatch(setPresets(presetsRes.data));

        if (businessId) {
          const bizRes: ApiResponse<TDesignSystem[]> = await getBusinessSystems(businessId).unwrap();
          if (bizRes?.data) dispatch(setBusinessSystems(bizRes.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch, businessId, getPresets, getBusinessSystems]);

  const handleDuplicate = async (id: string) => {
    if (!businessId) return;
    try {
      const res: ApiResponse<TDesignSystem> = await duplicateSystem({ id, businessId }).unwrap();
      if (res?.data) {
        dispatch(addBusinessSystem(res.data));
        toast.success(t('DesignSystem.duplicated'));
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleSetActive = async (id: string) => {
    if (!businessId) return;
    try {
      dispatch(setActiveSystem(id));
      await updateSystem({ id, data: { isActive: true } }).unwrap();
      toast.success(t('DesignSystem.setActiveSuccess'));
    } catch (error) {
      try {
        const bizRes: ApiResponse<TDesignSystem[]> = await getBusinessSystems(businessId).unwrap();
        if (bizRes?.data) dispatch(setBusinessSystems(bizRes.data));
      } catch (_) { /* rollback failed — UI state may be stale */ }
      showError(error);
    }
  };

  const handleSetActivePreset = async (presetId: string) => {
    if (!businessId) return;
    try {
      const dupRes: ApiResponse<TDesignSystem> = await duplicateSystem({ id: presetId, businessId }).unwrap();
      if (!dupRes?.data) return;
      dispatch(addBusinessSystem(dupRes.data));

      dispatch(setActiveSystem(dupRes.data.id));
      await updateSystem({ id: dupRes.data.id, data: { isActive: true } }).unwrap();
      toast.success(t('DesignSystem.duplicatedAndActive'));
    } catch (error) {
      try {
        const bizRes: ApiResponse<TDesignSystem[]> = await getBusinessSystems(businessId).unwrap();
        if (bizRes?.data) dispatch(setBusinessSystems(bizRes.data));
      } catch (_) { /* rollback failed */ }
      showError(error);
    }
  };

  const handleSave = async (data: Partial<TDesignSystem>) => {
    if (!selected) return;
    const { name, colors, gradients, typography, radius, border, shadow, spacing, brandElements, composition, scene } = data;
    const payload = { name, colors, gradients, typography, radius, border, shadow, spacing, brandElements, composition, scene };
    try {
      const res: ApiResponse<TDesignSystem> = await updateSystem({
        id: selected.id,
        data: payload,
      }).unwrap();
      if (res?.data) {
        dispatch(updateBusinessSystem(res.data));
        dispatch(setSelected(res.data));
        toast.success(t('DesignSystem.saved'));
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async (id?: string) => {
    const targetId = id || selected?.id;
    if (!targetId || !businessId) return;

    const confirmed = await confirm({
      title: t('DesignSystem.deleteTitle'),
      message: t('DesignSystem.deleteMessage'),
    });
    if (!confirmed) return;

    try {
      await deleteSystem({ id: targetId }).unwrap();
      dispatch(removeBusinessSystem(targetId));
      toast.success(t('DesignSystem.deleted'));
    } catch (error) {
      showError(error);
    }
  };

  const handleClose = () => {
    dispatch(closePanel());
    setDraft(null);
    setActiveElement(null);
    setEditingName(false);
  };

  if (!businessId) return null;

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg text-left font-semibold text-slate-800">
              {t('DesignSystem.title')}
            </h2>
            <p className="text-sm text-left text-slate-500 mt-1">
              {t('DesignSystem.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setUploadDlgOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
          >
            <Upload size={16} />
            {t('DesignSystem.upload')}
          </button>
        </div>

        {/* Custom Design Systems */}
        {businessSystems.length > 0 && (
          <div className="p-5">
            <h3 className="text-sm text-left font-semibold text-slate-700 uppercase tracking-wide mb-4">
              {t('DesignSystem.myDesignSystems')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {businessSystems.map((ds: TDesignSystem) => (
                <DesignSystemCard
                  key={ds.id}
                  designSystem={ds}
                  isSelected={selected?.id === ds.id}
                  onClick={() => dispatch(setSelected(ds))}
                  onDuplicate={() => handleDuplicate(ds.id)}
                  onSetActive={() => handleSetActive(ds.id)}
                  onDelete={() => handleDelete(ds.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Preset Templates */}
        <div className="p-5">
          <h3 className="text-sm text-left font-semibold text-slate-700 uppercase tracking-wide mb-4">
            {t('DesignSystem.presets')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map((ds: TDesignSystem) => (
              <DesignSystemCard
                key={ds.id}
                designSystem={ds}
                isSelected={selected?.id === ds.id}
                onClick={() => dispatch(setSelected(ds))}
                onDuplicate={() => handleDuplicate(ds.id)}
                onSetActive={() => handleSetActivePreset(ds.id)}
              />
            ))}
          </div>

          {presets.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">
              {t('DesignSystem.loadingPresets')}
            </p>
          )}
        </div>
      </section>

      <UploadDesignSystemDlg
        open={uploadDlgOpen}
        onClose={() => setUploadDlgOpen(false)}
      />

      {/* Design System Editor Dialog */}
      {panelOpen && selected && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  {!selected.isPreset && editingName ? (
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      autoFocus
                      className="text-lg font-semibold text-slate-800 bg-transparent border-b border-blue-500 focus:outline-none px-0 py-0 w-64"
                    />
                  ) : (
                    <h2 className="text-lg text-left font-semibold text-slate-800">{draft.name}</h2>
                  )}
                  {!selected.isPreset && (
                    <button
                      onClick={() => {
                        if (editingName && draft.name !== selected.name) {
                          handleSave({ name: draft.name });
                        }
                        setEditingName(!editingName);
                      }}
                      className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                        editingName
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {editingName ? <Check size={14} /> : <Pencil size={14} />}
                    </button>
                  )}
                </div>
                <p className="text-sm text-left text-slate-400">
                  {selected.isPreset ? t('DesignSystem.presetReadOnly') : t('DesignSystem.custom')}
                  {selected.isActive && (
                    <span className="ml-2 inline-block bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">{t('DesignSystem.active')}</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
              >
                <X size={18} strokeWidth={2} color="white" />
              </button>
            </div>

            {/* Body: Preview (left) + Panel (right) */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Preview */}
              <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 bg-slate-50">
                <DesignSystemPreview
                  designSystem={draft}
                  activeElement={activeElement}
                  onSelectElement={setActiveElement}
                />
              </div>

              {/* Right: Panel */}
              <DesignSystemPanel
                draft={draft}
                original={selected}
                activeElement={activeElement}
                onActiveElementChange={setActiveElement}
                onDraftChange={setDraft}
                onSave={handleSave}
                onDelete={selected.isPreset ? undefined : handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DesignSystem;
