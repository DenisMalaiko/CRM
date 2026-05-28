import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import {ImagePlay, WandSparkles} from "lucide-react";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useDeleteCreativeMutation,
  useDeleteCreativeBatchMutation,
  useLazyGetAiArtifactsQuery
} from "../../../../../../store/artifact/artifactApi";
import { useGetProfilesMutation } from "../../../../../../store/profile/profileApi";
import { useGetProductsMutation} from "../../../../../../store/products/productsApi";
import { setStories } from "../../../../../../store/artifact/artifactSlice";
import { setProfiles } from "../../../../../../store/profile/profileSlice";
import { setProducts } from "../../../../../../store/products/productsSlice";

// Components
import UpdateStoryDlg from "./updateStoryDlg/UpdateStoryDlg";
import CreateCreativeDlg from "../../../../../../components/createCreativeDlg/CreateCreativeDlg";
import SliderDlg from "../../../../../../components/sliderDlg/SliderDlg";
import EditPhotoDlg from "../../../../../../components/editPhotoDlg/EditPhotoDlg";
import { confirm } from "../../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../../utils/showError";
import { toDate } from "../../../../../../utils/toDate";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";
import { getStatusClass } from "../../../../../../utils/getStatusClass";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../../models/AIArtifact";
import { TBusinessProfile } from "../../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../../models/Product";

// Enum
import { GalleryType } from "../../../../../../enum/GalleryType";
import { BusinessProfileFocus } from "../../../../../../enum/BusinessProfileFocus";
import { ContentType } from "../../../../../../enum/ContentType";


function Stories() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getAiArtifacts ] = useLazyGetAiArtifactsQuery();
  const [ deleteCreative ] = useDeleteCreativeMutation();
  const [ deleteCreativeBatch ] = useDeleteCreativeBatchMutation();
  const [ getProfiles ] = useGetProfilesMutation();
  const [ getProducts ] = useGetProductsMutation();

  const [ open, setOpen ] = useState(false);
  const [ openSliderDlg, setOpenSliderDlg ] = useState<any>(null);
  const [ selectedMedia, setSelectedMedia ] = useState<any>(null);
  const [ openEditPhotoDlg, setOpenEditPhotoDlg ] = useState<{ photoId: string; mediaId: string } | null>(null);

  const [ selectedStory, setSelectedStory ] = useState<TAIArtifact | null>(null);
  const [ openCreative, setOpenCreative ] = useState(false);
  const [ selectedIds, setSelectedIds ] = useState<string[]>([]);
  const [ profilesIds, setProfilesIds ] = useState<string[]>([]);
  const [ productsIds, setProductsIds ] = useState<string[]>([]);

  // Posts
  const filteredStories = useSelector(((state: any) => {
    const { stories } = state.artifactModule;

    return stories?.filter((story: TAIArtifact) => {
      const profileMatch =
        profilesIds.length === 0 ||
        profilesIds.includes(story.businessProfileId);

      const productMatch =
        productsIds.length === 0 ||
        (Array.isArray(story.products) && story.products.some((p: any) => productsIds.includes(p.productId)));

      return profileMatch && productMatch;
    })
      .slice()
      .sort((a: TAIArtifact, b: TAIArtifact) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }));
  const { profiles } = useSelector((state: any) => state.profileModule);
  const { products } = useSelector((state: any) => state.productsModule);

  const profilesOptions = profiles?.map((profile: any) => ({ value: profile.id, label: profile.name })) || [];
  const productsOptions = products?.map((product: any) => ({ value: product.id, label: product.name })) || [];

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Story
          }).unwrap();

          const profilesResponse: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setStories(response.data));
          }
          if(profilesResponse && profilesResponse?.data) dispatch(setProfiles(profilesResponse.data));
          if(productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  // Delete Story
  const openConfirmDlg = async (e: any, item: TAIArtifact) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Story",
      message: "Are you sure you want to delete this story?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteCreative(item.id);
          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Story
          }).unwrap();

          if(response && response?.data) {
            dispatch(setStories(response.data));
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Create Story
  const openCreateStory = async () => {
    setOpenCreative(true);
  }

  // Edit Story
  const openEditStory = async (item: TAIArtifact) => {
    setSelectedStory(item);
    setOpen(true)
  }

  // Delete Selected
  const deleteStories = async () => {
    const ok = await confirm({
      title: "Delete Stories",
      message: "Are you sure you want to delete these stories?",
    });

    if(ok) {
      try {
        if (selectedIds?.length > 0) {
          await deleteCreativeBatch(selectedIds);

          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Story
          }).unwrap();

          if(response && response?.data) {
            dispatch(setStories(response.data));
            setSelectedIds([]);
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Open Image
  const openSlider = (media: any) => {
    setSelectedMedia(media);
    setOpenSliderDlg(true);
  }

  const handleSuccess = async () => {
    if (!businessId) return;
    try {
      const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
        businessId,
        type: GalleryType.Story
      }).unwrap();
      if(response && response?.data) dispatch(setStories(response.data));
    } catch (error: any) {
      showError(error);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Stories</h2>

            <div className="flex items-center gap-3">
              { profiles && profiles.length > 0 &&
                <Select
                  isMulti
                  placeholder="Select profiles"
                  options={profilesOptions}
                  value={profilesOptions.filter((option: { value: string; label: string; }) =>
                    profilesIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setProfilesIds(selected.map(option => option.value));
                  }}
                  styles={centeredSelectStyles}
                />
              }

              { products && products.length > 0 &&
                <Select
                  isMulti
                  placeholder="Select products"
                  options={productsOptions}
                  value={productsOptions.filter((option: { value: string; label: string; }) =>
                    productsIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setProductsIds(selected.map(option => option.value));
                  }}
                  styles={centeredSelectStyles}
                />
              }

              { selectedIds.length > 0 &&
                <button
                  onClick={() => deleteStories()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                > Delete Stories </button>
              }

              <button
                onClick={() => openCreateStory()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              > Create Story </button>
            </div>
          </div>
        </section>

        <div className="w-full mx-auto p-4">
          {filteredStories?.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-2">
              <span className="text-gray-400">No data</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {filteredStories?.map((item: TAIArtifact) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >

                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() =>
                          setSelectedIds(
                            selectedIds.includes(item.id)
                              ? selectedIds.filter(id => id !== item.id)
                              : [...selectedIds, item.id]
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                      />

                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${getStatusClass(item.status)}
                      `}>
                         {item?.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditStory(item)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50"
                      >
                        ✎
                      </button>

                      <button
                        onClick={(e) => openConfirmDlg(e, item)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50"
                      >
                        🗑
                      </button>
                    </div>
                  </div>


                  {/* Image */}
                  {(item?.media && item?.media.length) && (
                    <div className="flex flex-col gap-4 px-3 py-3">
                      <div className="relative w-full aspect-[9/16] bg-slate-100 rounded-xl overflow-hidden">
                        {item?.media.map((media) => (
                          <React.Fragment key={media.id}>
                            {media.type === 'Video' && (
                              <video
                                src={media.url}
                                poster={media.sourceUrl ?? undefined}
                                controls
                                playsInline
                                preload="metadata"
                                className="inset-0 h-full w-full rounded-xl object-cover"
                              />
                            )}

                            {media.type === 'Image' && (
                              <img
                                src={media.url}
                                alt="AI story"
                                className="inset-0 h-full w-full rounded-xl object-cover"
                              />
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center flex-col">
                              <div className="flex gap-5">
                                <button
                                  onClick={() => setOpenEditPhotoDlg({ photoId: item.id, mediaId: media.id })}
                                  className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                                >
                                  <WandSparkles size={18} />
                                </button>

                                <button
                                  onClick={() => openSlider([{url: media.url}])}
                                  className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                                >
                                  <ImagePlay size={18} />
                                </button>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto border-t border-slate-100 bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                        Headline
                      </p>

                      <p className="font-semibold text-slate-900 text-left">
                        {item.outputJson?.headline || "Story"}
                      </p>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                        {toDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <UpdateStoryDlg
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedStory(null);
          }}
          creative={selectedStory}
        ></UpdateStoryDlg>

        <CreateCreativeDlg
          open={openCreative}
          onClose={() => {
            setOpenCreative(false);
          }}
          focus={BusinessProfileFocus.GenerateStories}
        ></CreateCreativeDlg>

        <SliderDlg
          open={openSliderDlg}
          onClose={() => {
            setOpenSliderDlg(false);
          }}
          medias={selectedMedia}
        />

        <EditPhotoDlg
          open={!!openEditPhotoDlg}
          type={ContentType.AiArtifact}
          onClose={() => setOpenEditPhotoDlg(null)}
          photoId={openEditPhotoDlg?.photoId ?? ''}
          mediaId={openEditPhotoDlg?.mediaId}
          onSuccess={handleSuccess}
        ></EditPhotoDlg>
      </section>
    </div>
  )
}

export default Stories;
