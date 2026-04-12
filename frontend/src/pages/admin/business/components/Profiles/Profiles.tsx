import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetProfilesMutation, useDeleteProfileMutation, useGeneratePostsMutation } from "../../../../../store/profile/profileApi";
import { useGetProductsMutation } from "../../../../../store/products/productsApi";
import { useGetAudiencesMutation } from "../../../../../store/audience/audienceApi";
import { useGetPlatformsMutation } from "../../../../../store/platform/platformApi";
import { useGetPromptsMutation } from "../../../../../store/prompts/promptApi";
import { useGetIdeasMutation } from "../../../../../store/idea/ideaApi";
import { useLazyGetIdeasAIQuery } from "../../../../../store/ai/ideas/ideaAiApi";

import { setProfiles } from "../../../../../store/profile/profileSlice";
import { setProducts } from "../../../../../store/products/productsSlice";
import { setAudiences } from "../../../../../store/audience/audienceSlice";
import { setPlatforms } from "../../../../../store/platform/platformSlice";
import { setPrompts } from "../../../../../store/prompts/promptSlice";
import { setIdeas } from "../../../../../store/idea/ideaSlice";

// Components
import CreateProfileDlg from "./createProfileDlg/CreateProfileDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";
import { splitCamelCase } from "../../../../../utils/splitCamelCase";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TBusinessProfile } from "../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../models/Product";
import { TAudience } from "../../../../../models/Audience";
import { TPlatform } from "../../../../../models/Platform";
import { TIdea } from "../../../../../models/Idea";

// Enum
import { BusinessProfileFocus } from "../../../../../enum/BusinessProfileFocus";
import {setIdeasAi} from "../../../../../store/ai/ideas/ideaAiSlice";
import {TIdeaAI} from "../../../../../models/IdeaAI";

function Profiles() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getProfiles ] = useGetProfilesMutation();
  const [ deleteProfile ] = useDeleteProfileMutation();
  const [ getProducts ] = useGetProductsMutation();
  const [ getAudiences ] = useGetAudiencesMutation();
  const [ getPlatforms ] = useGetPlatformsMutation();
  const [ generatePosts ] = useGeneratePostsMutation();
  const [ getPrompts ] = useGetPromptsMutation();
  const [ getIdeas ] = useGetIdeasMutation();
  const [ getIdeasAI ] = useLazyGetIdeasAIQuery();

  const { profiles } = useSelector((state: any) => state.profileModule);
  const [ open, setOpen ] = useState(false);
  const [ selectedProfile, setSelectedProfile ] = useState<any | null>(null);
  const [ loadingProfileId, setLoadingProfileId ] = useState<string | null>(null);
  const isGenerating = loadingProfileId !== null;
  const header = [
    { name: "Name", key: "name" },
    { name: "Profile Focus", key: "profileFocus" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ]

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
          const audiencesResponse: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
          const platformsResponse: ApiResponse<TPlatform[]> = await getPlatforms(businessId).unwrap();
          const promptsResponse: ApiResponse<any[]> = await getPrompts(businessId).unwrap();
          const ideasResponse: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();
          const ideasAiResponse: ApiResponse<TIdeaAI[]> = await getIdeasAI(businessId).unwrap();

          if(response && response?.data) dispatch(setProfiles(response.data));
          if(productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
          if(audiencesResponse && audiencesResponse?.data) dispatch(setAudiences(audiencesResponse.data));
          if(platformsResponse && platformsResponse?.data) dispatch(setPlatforms(platformsResponse.data));
          if(promptsResponse && promptsResponse?.data) dispatch(setPrompts(promptsResponse.data));
          if(ideasResponse && ideasResponse?.data) dispatch(setIdeas(ideasResponse.data));
          if(ideasAiResponse && ideasAiResponse?.data) dispatch(setIdeasAi(ideasAiResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  // Delete Profile
  const openConfirmDlg = async (e: any, item: TBusinessProfile) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Context",
      message: "Are you sure you want to delete this context?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteProfile(item.id).unwrap();
          if(responseDelete && responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          if(response && response?.data) {
            dispatch(setProfiles(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Edit Profile
  const openEditProfile = async (item: TBusinessProfile) => {
    setSelectedProfile(item);
    setOpen(true)
  }

  // Generate Posts
  const generateNewPosts = async (item: TBusinessProfile) => {
    try {
      setLoadingProfileId(item.id);

      const response: ApiResponse<TBusinessProfile[]> = await generatePosts(item.id).unwrap();

      if(response && response?.data) {
        toast.success(response.message);
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setLoadingProfileId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Context</h2>

            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Add Context
            </button>

            <CreateProfileDlg
              open={open}
              onClose={() => {
                setOpen(false);
                setSelectedProfile(null);
              }}
              profile={selectedProfile}
            ></CreateProfileDlg>
          </div>
        </section>

        <div className="w-full mx-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {header.map((item, index) => (
                    <th
                      key={item.key}
                      className={`
                        px-4 py-3 text-xs font-semibold uppercase tracking-wide
                        ${item.key === "actions" ? "text-right" : "text-left"}
                        text-slate-600
                      `}
                    >{ item.name }</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {profiles?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={header.length}
                      className="py-6 text-center text-slate-400"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  profiles && profiles.map((item: any) => {
                    const isThisRowLoading = loadingProfileId === item.id;

                    return (
                      <tr key={item.id} onClick={() => openEditProfile(item)} className="bg-white hover:bg-slate-50 cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{ splitCamelCase(item.profileFocus) }</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <span className={`
                            inline-flex items-center rounded-full px-2.5 py-1
                            text-xs font-medium
                            ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                          `}>
                            {item.isActive ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                generateNewPosts(item)
                              }}
                              disabled={isGenerating}
                              className={`
                                px-4 py-2 rounded-lg shadow text-white
                                flex items-center gap-2 justify-center
                                ${
                                    isThisRowLoading
                                      ? "bg-blue-400 cursor-not-allowed"
                                      : isGenerating
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                  }
                              `}
                            >
                              {isThisRowLoading ? (
                                <>
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                  Creating...
                                </>
                              ) : (
                                `Create ${item.profileFocus === BusinessProfileFocus.GeneratePosts ? "Post" : "Story"}`
                              )}
                            </button>

                            <button onClick={() => openEditProfile(item)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                              ✎
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openConfirmDlg(e, item)
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
export default Profiles;