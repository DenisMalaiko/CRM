import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { showError } from "../../../../../../utils/showError";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";
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
} from "../../../../../../store/designSystem/designSystemSlice";

// Components
import DesignSystemCard from "./components/designSystem/DesignSystemCard";
import DesignSystemPanel from "./components/designSystem/DesignSystemPanel";
import DesignSystemPreview from "./components/designSystem/DesignSystemPreview";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TDesignSystem } from "../../../../../../models/DesignSystem";

function DesignSystem() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [getPresets] = useLazyGetDesignSystemPresetsQuery();
  const [getBusinessSystems] = useLazyGetBusinessDesignSystemsQuery();
  const [duplicateSystem] = useDuplicateDesignSystemMutation();
  const [updateSystem] = useUpdateDesignSystemMutation();
  const [deleteSystem] = useDeleteDesignSystemMutation();

  const { presets, businessSystems, selected, panelOpen } = useSelector(
    (state: any) => state.designSystemModule
  );

  const [draft, setDraft] = useState<TDesignSystem | null>(null);
  const [activeElement, setActiveElement] = useState<string | null>(null);

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
  }, [dispatch, businessId]);

  const handleDuplicate = async (id: string) => {
    if (!businessId) return;
    try {
      const res: ApiResponse<TDesignSystem> = await duplicateSystem({ id, businessId }).unwrap();
      if (res?.data) {
        dispatch(addBusinessSystem(res.data));
        dispatch(setSelected(res.data));
        toast.success("Design system duplicated");
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleSave = async (data: Partial<TDesignSystem>) => {
    if (!selected) return;
    try {
      const res: ApiResponse<TDesignSystem> = await updateSystem({
        id: selected.id,
        data,
      }).unwrap();
      if (res?.data) {
        dispatch(updateBusinessSystem(res.data));
        dispatch(setSelected(res.data));
        toast.success("Design system saved");
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async () => {
    if (!selected || !businessId) return;
    try {
      await deleteSystem({ id: selected.id }).unwrap();
      dispatch(removeBusinessSystem(selected.id));
      toast.success("Design system deleted");
    } catch (error) {
      showError(error);
    }
  };

  const handleClose = () => {
    dispatch(closePanel());
    setDraft(null);
    setActiveElement(null);
  };

  if (!businessId) return null;

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4">
          <h2 className="text-lg text-left font-semibold text-slate-800">
            Design System
          </h2>
          <p className="text-sm text-left text-slate-500 mt-1">
            Choose a preset or create your own by duplicating a template
          </p>
        </div>

        {/* Custom Design Systems */}
        {businessSystems.length > 0 && (
          <div className="p-5">
            <h3 className="text-sm text-left font-semibold text-slate-700 uppercase tracking-wide mb-4">
              My Design Systems
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {businessSystems.map((ds: TDesignSystem) => (
                <DesignSystemCard
                  key={ds.id}
                  designSystem={ds}
                  isSelected={selected?.id === ds.id}
                  onClick={() => dispatch(setSelected(ds))}
                  onDuplicate={() => handleDuplicate(ds.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Preset Templates */}
        <div className="p-5">
          <h3 className="text-sm text-left font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Presets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map((ds: TDesignSystem) => (
              <DesignSystemCard
                key={ds.id}
                designSystem={ds}
                isSelected={selected?.id === ds.id}
                onClick={() => dispatch(setSelected(ds))}
                onDuplicate={() => handleDuplicate(ds.id)}
              />
            ))}
          </div>

          {presets.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">
              Loading presets...
            </p>
          )}
        </div>
      </section>

      {/* Design System Editor Dialog */}
      {panelOpen && selected && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{draft.name}</h2>
                <p className="text-sm text-slate-400">{selected.isPreset ? "Preset · Read only" : "Custom"}</p>
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
