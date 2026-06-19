import React, { useState, useEffect, useMemo } from "react";
import { X, Pencil, Layers } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useGenerateContentPlanMutation,
  useLazyGetContentPlansQuery,
} from "../../../../../../store/contentPlan/contentPlanApi";
import { setContentPlans } from "../../../../../../store/contentPlan/contentPlanSlice";
import { useGetProductsMutation } from "../../../../../../store/products/productsApi";
import { setProducts } from "../../../../../../store/products/productsSlice";
import { useGetAudiencesMutation } from "../../../../../../store/audience/audienceApi";
import { setAudiences } from "../../../../../../store/audience/audienceSlice";
import { useGetIdeasMutation } from "../../../../../../store/idea/ideaApi";
import { setIdeas } from "../../../../../../store/idea/ideaSlice";
import { useLazyGetIdeasAIQuery } from "../../../../../../store/ai/ideas/ideaAiApi";
import { setIdeasAi } from "../../../../../../store/ai/ideas/ideaAiSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../store";

// Components
import Select from "react-select";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TContentPlan, TContentPlanGenerate } from "../../../../../../models/ContentPlan";
import { TProduct } from "../../../../../../models/Product";
import { TAudience } from "../../../../../../models/Audience";
import { TIdea } from "../../../../../../models/Idea";
import { TIdeaAI } from "../../../../../../models/IdeaAI";

// Utils
import { showError } from "../../../../../../utils/showError";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";
import { StylesConfig } from "react-select";

// Enum
import { IdeaStatus } from "../../../../../../enum/IdeaStatus";

type SelectOption = { value: string; label: string };
type IdeaSelectOption = SelectOption & { type: "manual" | "ai" };

const MODE_OPTIONS = [
  {
    value: "manual" as const,
    title: "Create manually",
    description: "Select audiences, products, and ideas manually",
    icon: Pencil,
  },
  {
    value: "profile" as const,
    title: "From business profile",
    description: "Generate content plan from business profile context",
    icon: Layers,
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

function GenerateContentPlanDlg({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ generateContentPlan ] = useGenerateContentPlanMutation();
  const [ getContentPlans ] = useLazyGetContentPlansQuery();
  const [ getProducts ] = useGetProductsMutation();
  const [ getAudiences ] = useGetAudiencesMutation();
  const [ getIdeas ] = useGetIdeasMutation();
  const [ getIdeasAI ] = useLazyGetIdeasAIQuery();

  const { products } = useSelector((state: RootState) => state.productsModule);
  const { audiences } = useSelector((state: RootState) => state.audienceModule);
  const { ideas } = useSelector((state: RootState) => state.ideaModule);
  const { ideasAi } = useSelector((state: RootState) => state.ideaAiModule);

  const [selected, setSelected] = useState<"manual" | "profile">("manual");
  const [isLoading, setIsLoading] = useState(false);

  const { form, handleChange } = useForm({
    productsIds: [] as string[],
    audiencesIds: [] as string[],
    ideasIds: [] as string[],
    context: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
          const audiencesResponse: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
          const ideasResponse: ApiResponse<TIdea[]> = await getIdeas({ businessId }).unwrap();
          const ideasAiResponse: ApiResponse<TIdeaAI[]> = await getIdeasAI(businessId).unwrap();

          if (productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
          if (audiencesResponse && audiencesResponse?.data) dispatch(setAudiences(audiencesResponse.data));
          if (ideasResponse && ideasResponse?.data) dispatch(setIdeas(ideasResponse.data));
          if (ideasAiResponse && ideasAiResponse?.data) dispatch(setIdeasAi(ideasAiResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const productsOptions = useMemo(
    () => products?.map((product: TProduct) => ({ value: product.id, label: product.name })) ?? [],
    [products]
  );

  const audiencesOptions = useMemo(
    () => audiences?.map((audience: TAudience) => ({ value: audience.id, label: audience.name })) ?? [],
    [audiences]
  );

  const allIdeasOptions = useMemo(() => {
    return [
      ...(ideas ?? [])
        .filter((idea: TIdea) => idea.status === IdeaStatus.Used)
        .map((idea: TIdea) => ({
          label: idea.title,
          value: idea.id,
          type: "manual" as const,
        })),
      ...(ideasAi ?? [])
        .filter((idea: TIdeaAI) => idea.status === IdeaStatus.Used)
        .map((idea: TIdeaAI) => ({
          label: idea.title,
          value: idea.id,
          type: "ai" as const,
        })),
    ];
  }, [ideas, ideasAi]);

  if (!open) return null;
  if (!businessId) return null;

  const generate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const formData: TContentPlanGenerate = { mode: selected };

      if (selected === "manual") {
        formData.productsIds = form.productsIds;
        formData.audiencesIds = form.audiencesIds;
        formData.ideasIds = form.ideasIds;
      }

      if (selected === "profile") {
        formData.context = form.context;
      }

      const response: ApiResponse<TContentPlan[]> = await generateContentPlan({
        id: businessId,
        form: formData,
      }).unwrap();

      if (response && response?.data) {
        const responsePlans: ApiResponse<TContentPlan[]> = await getContentPlans(businessId).unwrap();

        if (responsePlans && responsePlans?.data) {
          dispatch(setContentPlans(responsePlans.data));
          toast.success(response.message);
          onClose();
        }
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-lg font-semibold">Generate Content Plan</h2>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={generate}>
          <div>
            <div className="grid grid-cols-2 gap-4">
              {MODE_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={option.value}
                      checked={selected === option.value}
                      onChange={() => setSelected(option.value)}
                      className="hidden peer"
                    />

                    <div className="p-4 border rounded-xl transition-all border-gray-300 hover:border-gray-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 peer-checked:bg-blue-100 peer-checked:text-blue-600">
                          <Icon className="w-5 h-5 text-gray-600 peer-checked:text-blue-600" />
                        </div>

                        <div>
                          <div className="font-semibold text-gray-800 text-left">
                            {option.title}
                          </div>
                          <div className="text-sm text-gray-500 text-left">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {selected === "manual" && (
            <div className="relative z-20 space-y-3">
              {!!productsOptions.length && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 text-left mb-1">Products</label>
                  <Select<SelectOption>
                    options={productsOptions}
                    value={productsOptions.find(
                      (option) => form.productsIds[0] === option.value
                    )}
                    onChange={(selected) =>
                      handleChange({
                        name: "productsIds",
                        value: selected ? [selected.value] : [],
                      })
                    }
                    styles={centeredSelectStyles as StylesConfig<SelectOption>}
                  />
                </div>
              )}

              {!!audiencesOptions.length && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 text-left mb-1">Audiences</label>
                  <Select<SelectOption, true>
                    isMulti
                    options={audiencesOptions}
                    value={audiencesOptions.filter((option) =>
                      form.audiencesIds.includes(option.value)
                    )}
                    onChange={(selected) =>
                      handleChange({
                        name: "audiencesIds",
                        value: selected.map((o) => o.value),
                      })
                    }
                    styles={centeredSelectStyles as StylesConfig<SelectOption, true>}
                  />
                </div>
              )}

              {!!allIdeasOptions.length && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 text-left mb-1">Ideas</label>
                  <Select<IdeaSelectOption, true>
                    isMulti
                    options={allIdeasOptions}
                    value={allIdeasOptions.filter((option) =>
                      form.ideasIds.includes(option.value)
                    )}
                    onChange={(selected) =>
                      handleChange({
                        name: "ideasIds",
                        value: selected.map((o) => o.value),
                      })
                    }
                    formatOptionLabel={(option) => (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{option.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            option.type === "ai"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {option.type === "ai" ? "AI" : "Competitor"}
                        </span>
                      </div>
                    )}
                    styles={centeredSelectStyles as StylesConfig<IdeaSelectOption, true>}
                  />
                </div>
              )}
            </div>
          )}

          {selected === "profile" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">Context</label>
              <textarea
                value={form.context}
                onChange={(e) => handleChange({ name: "context", value: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe your business profile context..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg border text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : ("Generate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateContentPlanDlg;
