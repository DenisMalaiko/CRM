import React, { useState, useEffect, useMemo } from "react";
import { X, Pencil, Layers } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../hooks/useForm";
import { useValidation } from "../../hooks/useValidation";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import { useGetProfilesMutation, useGeneratePostsMutation } from "../../store/profile/profileApi";
import { useGetProductsMutation } from "../../store/products/productsApi";
import { useGetAudiencesMutation } from "../../store/audience/audienceApi";
import { useGetPromptsMutation } from "../../store/prompts/promptApi";
import { useGetIdeasMutation } from "../../store/idea/ideaApi";
import { useGetPhotosMutation, useLazyGetDefaultPhotosQuery } from "../../store/gallery/galleryApi";
import { useLazyGetAiArtifactsQuery, useCreateCreativeManuallyMutation } from "../../store/artifact/artifactApi";

import { setProfiles } from "../../store/profile/profileSlice";
import { setProducts } from "../../store/products/productsSlice";
import { setAudiences } from "../../store/audience/audienceSlice";
import { setPrompts } from "../../store/prompts/promptSlice";
import { setIdeas } from "../../store/idea/ideaSlice";
import {setPosts, setStories} from "../../store/artifact/artifactSlice";

// Models
import { ApiResponse } from "../../models/ApiResponse";
import { TBusinessProfile } from "../../models/BusinessProfile";
import { TProduct } from "../../models/Product";
import { TAudience } from "../../models/Audience";
import { TPrompt } from "../../models/Prompt";
import { TIdea } from "../../models/Idea";
import { TGalleryPhoto } from "../../models/Gallery";
import { TAIArtifact } from "../../models/AIArtifact";

// Components
import Select from "react-select";
import SelectGalleryDlg
  from "../../pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg";

// Utils
import { showError } from "../../utils/showError";
import { centeredSelectStyles } from "../../utils/reactSelectStyles";
import { ChangeArg, isNativeEvent } from "../../utils/isNativeEvent";
import {isArray, isRequired, isString} from "../../utils/validations";

// Enum
import { BusinessProfileFocus } from "../../enum/BusinessProfileFocus";
import { IdeaStatus } from "../../enum/IdeaStatus";
import { GalleryType } from "../../enum/GalleryType";

type Props = {
  open: boolean;
  onClose: () => void;
  focus: string;
};

function CreateCreativeDlg({ open, onClose, focus }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getAiArtifacts ] = useLazyGetAiArtifactsQuery();
  const [ generatePosts ] = useGeneratePostsMutation();
  const [ getProfiles ] = useGetProfilesMutation();
  const [ getProducts ] = useGetProductsMutation();
  const [ getAudiences ] = useGetAudiencesMutation();
  const [ getPrompts ] = useGetPromptsMutation();
  const [ getIdeas ] = useGetIdeasMutation();
  const [ createCreativeManually ] = useCreateCreativeManuallyMutation();
  const [ getPhotos ] = useGetPhotosMutation();
  const [ getDefaultPhotos ] = useLazyGetDefaultPhotosQuery();

  const { profiles } = useSelector((state: any) => state.profileModule);
  const { products } = useSelector((state: any) => state.productsModule);
  const { audiences } = useSelector((state: any) => state.audienceModule);
  const { prompts } = useSelector((state: any) => state.promptModule);
  const { ideas } = useSelector((state: any) => state.ideaModule);
  const { photos, defaultPhotos } = useSelector((state: any) => state.galleryModule);

  const profilesOptions = profiles?.filter((profile: TBusinessProfile) => profile.profileFocus === focus).map((profile: TBusinessProfile) => ({ value: profile.id, label: profile.name })) ?? [];
  const productsOptions = products?.map((product: TProduct) => ({ value: product.id, label: product.name })) ?? [];
  const audiencesOptions = audiences?.map((audience: TAudience) => ({ value: audience.id, label: audience.name })) ?? [];
  const promptsOptions = prompts?.map((prompt: TPrompt) => ({ value: prompt.id, label: `${prompt.name} | ${prompt.purpose}` })) ?? [];
  const ideasOptions = ideas?.filter((idea: TIdea) => idea.status === IdeaStatus.Used).map((idea: TIdea) => ({ value: idea.id, label: idea.title })) ?? [];
  const mappedPhotos = photos.map((photo: any) => ({ ...photo, isDefault: false }));
  const mappedDefaultPhotos = defaultPhotos.map((photo: any) => ({ ...photo, isDefault: true }));
  const allPhotos = [...mappedDefaultPhotos, ...mappedPhotos];

  const [selected, setSelected] = useState("manual");
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openGalleryDlg, setOpenGalleryDlg] = useState(false)

  // Init Form
  const initialForm = useMemo(() => {
    return {
      type: focus === BusinessProfileFocus.GeneratePosts ? "Post" : "Story",
      productsIds: [] as string [],
      audiencesIds: [] as string[],
      ideasIds: [] as string[],
      photosIds: [] as string[],
      defaultPhotosIds: [] as string[],
      prompt: "" as string,
    }
  }, [businessId]);

  // Form Hook
  const { form, handleChange, resetForm, setForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField } = useValidation({
    type: (value) => isRequired(value),
    productsIds: (value) => isArray(value),
    audiencesIds: (value) => isArray(value),
    ideasIds: (value) => isArray(value),
    prompt: (value) => isString(value),
    photosIds: (value) => isArray(value),
    defaultPhotosIds: (value) => isArray(value),
  });

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
          const audiencesResponse: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
          const promptsResponse: ApiResponse<TPrompt[]> = await getPrompts(businessId).unwrap();
          const ideasResponse: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();

          if(response && response?.data) dispatch(setProfiles(response.data));
          if(productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
          if(audiencesResponse && audiencesResponse?.data) dispatch(setAudiences(audiencesResponse.data));
          if(promptsResponse && promptsResponse?.data) dispatch(setPrompts(promptsResponse.data));
          if(ideasResponse && ideasResponse?.data) dispatch(setIdeas(ideasResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch])

  if (!open) return null;
  if (!businessId) return null;

  const options = [
    {
      value: "manual",
      title: "Create manually",
      description: "Write and customize your post step by step",
      icon: Pencil,
    },
    {
      value: "context",
      title: "Generate from context",
      description: "Generate and customize your post using context",
      icon: Layers,
    },
  ];

  const _createCreativeByContext = async () => {
    if(!selectedContextId) {
      setError("Please select a context");
      return;
    }

    setError(null);

    try {
      setIsLoading(true);
      const response: ApiResponse<TBusinessProfile[]> = await generatePosts(selectedContextId).unwrap();

      if(response && response?.data) {
        const responsePosts: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
          businessId,
          type: focus === BusinessProfileFocus.GeneratePosts ? GalleryType.Post : GalleryType.Story,
        }).unwrap();

        if(responsePosts && responsePosts?.data) {
          if(focus === BusinessProfileFocus.GeneratePosts) {
            dispatch(setPosts(responsePosts.data));
          }

          if(focus === BusinessProfileFocus.GenerateStories) {
            dispatch(setStories(responsePosts.data));
          }

          toast.success(response.message);
          onClose()
        }
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const _createCreativeByManual = async () => {
    try {
      setIsLoading(true);
      const response: ApiResponse<TAIArtifact> = await createCreativeManually({ id: businessId, form }).unwrap();

      if(response && response?.data) {

        const responsePosts: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
          businessId,
          type: focus === BusinessProfileFocus.GeneratePosts ? GalleryType.Post : GalleryType.Story,
        }).unwrap();

        if(responsePosts && responsePosts?.data) {
          if(focus === BusinessProfileFocus.GeneratePosts) {
            dispatch(setPosts(responsePosts.data));
          }

          if(focus === BusinessProfileFocus.GenerateStories) {
            dispatch(setStories(responsePosts.data));
          }

          toast.success(response.message);
          resetForm();
          onClose()
        }
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(selected === "manual") {
      console.log("FORM ", form);
      await _createCreativeByManual();
    }

    if(selected === "context") {
      await _createCreativeByContext();
    }
  }

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  // Delete Image
  const deleteImage = async (imageId?: string) => {
    setForm(prev => ({
      ...prev,
      photosIds: prev.photosIds.filter((id: string) => id !== imageId),
      defaultPhotosIds: prev.defaultPhotosIds.filter((id: string) => id !== imageId)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[95vh]">
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-lg font-semibold">Create { focus === BusinessProfileFocus.GeneratePosts ? "Post" : "Story" }</h2>

          {/* Close */}
          <button
            onClick={() => onClose()}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        <form className="space-y-4" onSubmit={create} action="">
          <div>
            <div className="grid grid-cols-2 gap-4">
              {options.map((option) => {
                const Icon = option.icon;

                return (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="postType"
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
                          <div className="font-semibold text-gray-800">
                            {option.title}
                          </div>
                          <div className="text-sm text-gray-500">
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

          <div>
            {selected === "manual" && (
              <div>
                <div className="relative z-20">
                  <div className="mb-3">
                    { !!productsOptions.length && (
                      <>
                        <div className="flex items-center gap-2 justify-between">
                          <label className="block text-sm font-medium text-slate-700 text-left mb-1">Products</label>
                        </div>

                        <Select
                          options={productsOptions}
                          value={productsOptions.find(
                            (option: { label: string, value: string }) => form.productsIds[0] === option.value
                          )}
                          onChange={(selected) =>
                            onChange({
                              name: "productsIds",
                              value: selected ? [selected.value] : [],
                            })
                          }
                          styles={centeredSelectStyles}
                        />

                        {errors.productsIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.productsIds}</p>}
                      </>
                    )}
                  </div>

                  <div className="mb-3">
                    { !!ideasOptions.length && (
                      <>
                        <div className="flex items-center gap-2 justify-between">
                          <label className="block text-sm font-medium text-slate-700 text-left mb-1">Ideas</label>
                        </div>

                        <Select
                          options={ideasOptions}
                          value={ideasOptions.find(
                            (option: { label: string, value: string }) => form.ideasIds[0] === option.value
                          )}
                          onChange={(selected) =>
                            onChange({
                              name: "ideasIds",
                              value: selected ? [selected.value] : [],
                            })
                          }
                          styles={centeredSelectStyles}
                        />

                        {errors.ideasIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.ideasIds}</p>}
                      </>
                    )}
                  </div>

                  <div className="mb-3">
                    { !!audiencesOptions.length && (
                      <>
                        <div className="flex items-center gap-2 justify-between">
                          <label className="block text-sm font-medium text-slate-700 text-left mb-1">Audiences</label>
                        </div>

                        <Select
                          isMulti
                          options={audiencesOptions}
                          value={audiencesOptions.filter((option: any) =>
                            form.audiencesIds.includes(option.value)
                          )}
                          onChange={(selected: any) =>
                            onChange({
                              name: "audiencesIds",
                              value: selected.map((o: any) => o.value),
                            })
                          }
                          styles={centeredSelectStyles}
                        />

                        {errors.audiencesIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.audiencesIds}</p>}
                      </>
                    )}
                  </div>

                  <div className="mb-3">
                    <>
                      <div className="flex items-center gap-2 justify-between">
                        <label className="block text-sm font-medium text-slate-700 text-left mb-1">Prompt</label>
                      </div>

                      <textarea
                        value={form.prompt}
                        onChange={(e) =>
                          onChange({
                            name: "prompt",
                            value: e.target.value,
                          })
                        }
                        className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        rows={5}
                      />
                    </>
                  </div>
                </div>

                <div className="relative z-10 mb-3">
                  <div className="flex items-center gap-2 justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700 text-left">Photos (max 3)</label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {allPhotos.filter((x: TGalleryPhoto) =>
                      form.photosIds.includes(x.id) ||
                      form.defaultPhotosIds.includes(x.id)
                    ).map((photo: TGalleryPhoto) => (
                      <div key={photo.id} className="relative w-full aspect-square rounded-xl overflow-hidden border group">
                        <img src={photo.url} className="w-full h-full object-cover" alt=""/>

                        <button
                          onClick={() => deleteImage(photo.id)}
                          className="absolute top-2 right-2 text-white text-xl z-10 bg-blue-600 rounded-full p-1 hover:bg-blue-700 cursor-pointer"
                        >
                          <X size={15} strokeWidth={2} color="white"></X>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div
                    onClick={() => setOpenGalleryDlg(true)}
                    className="px-4 mt-3 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center cursor-pointer hover:bg-blue-700 w-max"
                  > Select Photos </div>
                </div>
              </div>
            )}
          </div>

          <div>
            {selected === "context" && (
              <>
                <div className="flex items-center gap-2 justify-between">
                  <label className="block text-sm font-medium text-slate-700 text-left mb-1">Context</label>
                </div>

                <Select
                  options={profilesOptions}
                  value={profilesOptions.find(
                    (option: { label: string, value: string }) => selectedContextId === option.value
                  )}
                  onChange={(selected: any) => setSelectedContextId(selected ? selected.value : null)}
                  styles={centeredSelectStyles}
                />

                {error && <p className="text-red-500 text-sm mt-2 text-left">{error}</p>}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg border  text-slate-600
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
              { isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                    Creating...
                  </>
                ) : ("Create")
              }
            </button>
          </div>
        </form>
      </div>

      <SelectGalleryDlg
        open={openGalleryDlg}
        focus={focus}
        selectedIds={[...form.photosIds, ...form.defaultPhotosIds]}
        onClose={() => setOpenGalleryDlg(false)}
        onSelect={(selectedPhotos: TGalleryPhoto[]) => {

          const businessIds = selectedPhotos
            .filter(p => !p.isDefault)
            .map(p => p.id);

          const defaultIds = selectedPhotos
            .filter(p => p.isDefault)
            .map(p => p.id);

          setForm(prev => ({
            ...prev,
            photosIds: Array.from(
              new Set([...prev.photosIds, ...businessIds])
            ),
            defaultPhotosIds: Array.from(
              new Set([...prev.defaultPhotosIds, ...defaultIds])
            )
          }));

          setOpenGalleryDlg(false);
        }}
      />
    </div>
  )
}

export default CreateCreativeDlg;