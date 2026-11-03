import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select, { StylesConfig } from "react-select";
import {Download, Image, ImagePlay, WandSparkles} from "lucide-react";

// Redux
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import {
  useDeleteCreativeMutation,
  useDeleteCreativeBatchMutation,
  useLazyGetAiArtifactsQuery
} from "../../../../../../store/artifact/artifactApi";
import { useGetProfilesMutation } from "../../../../../../store/profile/profileApi";
import { useGetProductsMutation} from "../../../../../../store/products/productsApi";
import { setPosts } from "../../../../../../store/artifact/artifactSlice";
import { setProfiles } from "../../../../../../store/profile/profileSlice";
import { setProducts } from "../../../../../../store/products/productsSlice";

// Components
import UpdatePostDlg from "./updatePostDlg/UpdatePostDlg";
import CreateCreativeDlg from "../../../../../../components/createCreativeDlg/CreateCreativeDlg";
import SliderDlg from "../../../../../../components/sliderDlg/SliderDlg";
import EditPhotoDlg from "../../../../../../components/editPhotoDlg/EditPhotoDlg";
import { confirm } from "../../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../../utils/showError";
import { getStatusClass } from "../../../../../../utils/getStatusClass";
import { toDate } from "../../../../../../utils/toDate";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../../models/AIArtifact";
import { TBusinessProfile } from "../../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../../models/Product";

// Enum
import { GalleryType } from "../../../../../../enum/GalleryType";
import { BusinessProfileFocus } from "../../../../../../enum/BusinessProfileFocus";
import { ContentType } from "../../../../../../enum/ContentType";

// Types
type SelectOption = { value: string; label: string };

function Posts() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const business = useAppSelector((state) => state.businessModule.business);
  const businessName = business?.name ?? "";

  const [ getAiArtifacts ] = useLazyGetAiArtifactsQuery();
  const [ deleteCreative ] = useDeleteCreativeMutation();
  const [ deleteCreativeBatch ] = useDeleteCreativeBatchMutation();
  const [ getProfiles ] = useGetProfilesMutation();
  const [ getProducts ] = useGetProductsMutation();

  const [ open, setOpen ] = useState(false);
  const [ openSliderDlg, setOpenSliderDlg ] = useState<any>(null);
  const [ selectedMedia, setSelectedMedia ] = useState<any>(null);
  const [ openEditPhotoDlg, setOpenEditPhotoDlg ] = useState<{ photoId: string; mediaId: string } | null>(null);

  const [ selectedPost, setSelectedPost ] = useState<TAIArtifact | null>(null);
  const [ openCreative, setOpenCreative ] = useState(false);
  const [ selectedIds, setSelectedIds ] = useState<string[]>([]);
  const [ expandedIds, setExpandedIds ] = useState<string[]>([]);
  const [ profilesIds, setProfilesIds ] = useState<string[]>([]);
  const [ productsIds, setProductsIds ] = useState<string[]>([]);

  // Posts
  const filteredPosts = useAppSelector((state) => {
    const { posts } = state.artifactModule;

    return posts?.filter((post: TAIArtifact) => {
      const profileMatch =
        profilesIds.length === 0 ||
        profilesIds.includes(post.businessProfileId);

      const productMatch =
        productsIds.length === 0 ||
        (Array.isArray(post.products) && post.products.some((p: any) => productsIds.includes(p.productId)));

      return profileMatch && productMatch;
    })
      .slice()
      .sort((a: TAIArtifact, b: TAIArtifact) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  });
  const { profiles } = useAppSelector((state) => state.profileModule);
  const { products } = useAppSelector((state) => state.productsModule);

  const profilesOptions: SelectOption[] = profiles?.map((profile: any) => ({ value: profile.id, label: profile.name })) || [];
  const productsOptions: SelectOption[] = products?.map((product: any) => ({ value: product.id, label: product.name })) || [];


  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Post
          }).unwrap();

          const profilesResponse: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setPosts(response.data));
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

  // Delete Post
  const openConfirmDlg = async (e: any, item: TAIArtifact) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Post",
      message: "Are you sure you want to delete this post?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteCreative(item.id);
          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Post
          }).unwrap();

          if(response && response?.data) {
            dispatch(setPosts(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Create Post
  const openCreatePost = async () => {
    setOpenCreative(true);
  }

  // Edit Post
  const openEditPost = async (item: TAIArtifact) => {
    setSelectedPost(item);
    setOpen(true)
  }

  // Delete Selected
  const deletePosts = async () => {
    const ok = await confirm({
      title: "Delete Posts",
      message: "Are you sure you want to delete these posts?",
    });

    if(ok) {
      try {
        if (selectedIds?.length > 0) {
          await deleteCreativeBatch(selectedIds);

          const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
            businessId,
            type: GalleryType.Post
          }).unwrap();

          if(response && response?.data) {
            dispatch(setPosts(response.data));
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
        type: GalleryType.Post
      }).unwrap();
      if(response && response?.data) dispatch(setPosts(response.data));
    } catch (error: any) {
      showError(error);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Posts</h2>

            <div className="flex items-center gap-3">
              { profiles && profiles.length > 0 &&
                <Select<SelectOption, true>
                  isMulti
                  placeholder="Select profiles"
                  options={profilesOptions}
                  value={profilesOptions.filter((option) =>
                    profilesIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setProfilesIds(selected.map((option) => option.value));
                  }}
                  styles={centeredSelectStyles as StylesConfig<SelectOption, true>}
                />
              }

              { products && products.length > 0 &&
                <Select<SelectOption, true>
                  isMulti
                  placeholder="Select products"
                  options={productsOptions}
                  value={productsOptions.filter((option) =>
                    productsIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setProductsIds(selected.map((option) => option.value));
                  }}
                  styles={centeredSelectStyles as StylesConfig<SelectOption, true>}
                />
              }

              { selectedIds.length > 0 &&
                <button
                  onClick={() => deletePosts()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                > Delete Posts </button>
              }

              <button
                onClick={() => openCreatePost()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              > Create Post </button>
            </div>
          </div>
        </section>

        <div className="w-full mx-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {filteredPosts?.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-2">
                <span className="text-gray-400">No data</span>
              </div>
            ) : (
              filteredPosts?.map((item: TAIArtifact) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden text-left"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-base">
                          {businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">{businessName}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{toDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => setSelectedIds(selectedIds.includes(item.id) ? selectedIds.filter(id => id !== item.id) : [...selectedIds, item.id])}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <button onClick={() => openEditPost(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-50">
                        ✎
                      </button>
                      <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Post Body */}
                  <div className="px-4 pb-3 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {item.outputJson?.hook || "—"}
                    </p>
                    <div className="relative">
                      <p className={`text-sm text-slate-700 leading-relaxed whitespace-pre-wrap ${expandedIds.includes(item.id) ? "inline" : "line-clamp-2"}`}>
                        {item.outputJson?.body || "—"}
                        {expandedIds.includes(item.id) && (
                          <span
                            onClick={() => setExpandedIds((prev) => prev.filter((id) => id !== item.id))}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer ml-1"
                          >
                            Показати менше
                          </span>
                        )}
                      </p>
                      {!expandedIds.includes(item.id) && (
                        <span
                          onClick={() => setExpandedIds((prev) => [...prev, item.id])}
                          className="absolute bottom-0 right-0 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer pl-8 bg-gradient-to-r from-white/0 to-white to-30%"
                        >
                          ... Ще
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      {item.outputJson?.cta || "—"}
                    </p>
                  </div>

                  {/* Media */}
                  {item.media && item.media.length > 0 ? (
                    <div className="group relative overflow-hidden">
                      {item.media.map((media) => (
                        <React.Fragment key={media.id}>
                          {media.type === 'Video' && (
                            <video
                              src={media.url}
                              poster={media.sourceUrl ?? undefined}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full border-t border-slate-100"
                            />
                          )}
                          {media.type === 'Image' && (
                            <img
                              src={media.url}
                              alt="AI generated"
                              className="w-full border-t border-slate-100"
                            />
                          )}
                        </React.Fragment>
                      ))}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                        <div className="flex gap-5">
                          {item.media.map((media) => (
                            <React.Fragment key={`actions-${media.id}`}>
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
                              <button
                                onClick={() => window.open(media.url, '_blank')}
                                className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                              >
                                <Download size={18} />
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-4 mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2 p-5 min-h-28">
                      <Image size={28} className="text-slate-400" />
                      <p className="text-xs text-slate-500 text-center leading-relaxed">
                        {item.imagePrompt || "No media"}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto border-t border-slate-100 bg-slate-50 px-4 py-2.5" />
                </div>
              ))
            )}
          </div>
        </div>

        <UpdatePostDlg
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedPost(null);
          }}
          creative={selectedPost}
        ></UpdatePostDlg>

        <CreateCreativeDlg
          open={openCreative}
          onClose={() => {
            setOpenCreative(false);
          }}
          focus={BusinessProfileFocus.GeneratePosts}
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

export default Posts;
