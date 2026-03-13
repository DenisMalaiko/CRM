import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  useDeleteCreativeMutation,
  useLazyGetAiArtifactsQuery
} from "../../../../../store/artifact/artifactApi";
import { useGetProfilesMutation } from "../../../../../store/profile/profileApi";
import { useGetProductsMutation} from "../../../../../store/products/productsApi";
import { setStories } from "../../../../../store/artifact/artifactSlice";
import { setProfiles } from "../../../../../store/profile/profileSlice";
import { setProducts } from "../../../../../store/products/productsSlice";

// Components
import UpdateStoryDlg from "./updateStoryDlg/UpdateStoryDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";
import { toDate } from "../../../../../utils/toDate";
import { centeredSelectStyles } from "../../../../../utils/reactSelectStyles";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../models/AIArtifact";
import { TBusinessProfile } from "../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../models/Product";

// Enum
import { GalleryType } from "../../../../../enum/GalleryType";

function Stories() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getAiArtifacts ] = useLazyGetAiArtifactsQuery();
  const [ deleteCreative ] = useDeleteCreativeMutation();
  const [ getProfiles ] = useGetProfilesMutation();
  const [ getProducts ] = useGetProductsMutation();

  const [ open, setOpen ] = useState(false);
  const [ selectedCreative, setSelectedCreative ] = useState<TAIArtifact | null>(null);
  const [ selectedIds, setSelectedIds ] = useState<string[]>([]);
  const [ profilesIds, setProfilesIds ] = useState<string[]>([]);
  const [ productsIds, setProductsIds ] = useState<string[]>([]);

  // Creatives
  const filteredStories = useSelector(((state: any) => {
    const { stories } = state.artifactModule;

    console.log("STORIES", stories)

    return stories?.filter((creative: TAIArtifact) => {
      const profileMatch =
        profilesIds.length === 0 ||
        profilesIds.includes(creative.businessProfileId);

      const productMatch =
        productsIds.length === 0 ||
        (Array.isArray(creative.products) && creative.products.some((p: any) => productsIds.includes(p.productId)));

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

          console.log("RESPONSE ", response)

          const profilesResponse: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

          if(response && response?.data) dispatch(setStories(response.data));
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

  // Delete Creative
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

  // Edit Creative
  const openEditCreative = async (item: TAIArtifact) => {
    setSelectedCreative(item);
    setOpen(true)
  }

  // Delete Selected
  const deleteCreatives = async () => {
    const ok = await confirm({
      title: "Delete Artifacts",
      message: "Are you sure you want to delete this artifacts?",
    });

    if(ok) {
      try {
        if (selectedIds?.length > 0) {
          await Promise.all(
            selectedIds.map(async (id) => {
              await deleteCreative(id);
            })
          )
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
                  onClick={() => deleteCreatives()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                    Delete Stories
                </button>
              }
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
                  className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  {item?.imageUrl && (
                    <div className="relative w-full aspect-[9/16] bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt="AI story"
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      <div className="absolute w-full top-0 left-0 p-3 flex items-center gap-2 justify-between">
                        {/* Overlay controls */}
                        <div className="flex items-center gap-2">
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
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditCreative(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                          >
                            ✎
                          </button>

                          <button
                            onClick={(e) => openConfirmDlg(e, item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Bottom gradient info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                        <p className="text-sm font-semibold">
                          {item.outputJson?.headline || "Story"}
                        </p>

                        <p className="text-xs opacity-80">
                          {toDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <UpdateStoryDlg
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedCreative(null);
          }}
          creative={selectedCreative}
        ></UpdateStoryDlg>
      </section>
    </div>
  )
}

export default Stories;