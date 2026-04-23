import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ImagePlay, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { useAppDispatch } from "../../../../../store/hooks";
import { RootState } from "../../../../../store";
import {
  useGeneratePhotoAIMutation,
  useLazyGetPhotosAIQuery,
  useDeletePhotoAIMutation,
} from "../../../../../store/ai/photo/photoAiApi";
import { setPhotosAi } from "../../../../../store/ai/photo/photoAiSlice";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import SliderDlg from "../../../../../components/sliderDlg/SliderDlg";
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TAiPhoto } from "../../../../../models/AiPhoto";
import { showError } from "../../../../../utils/showError";

export function AiPhoto() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [openSliderDlg, setOpenSliderDlg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const [generatePhoto, { isLoading: isGenerating }] = useGeneratePhotoAIMutation();
  const [getPhotos] = useLazyGetPhotosAIQuery();
  const [deletePhoto] = useDeletePhotoAIMutation();

  const { photosAi } = useSelector((state: RootState) => state.photoAiModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TAiPhoto[]> = await getPhotos(businessId).unwrap();
          if (response && response.data) dispatch(setPhotosAi(response.data));
        }
      } catch (error) {
        showError(error);
      }
    };
    fetchData();
  }, [dispatch]);

  if (!businessId) return null;

  const handleGenerate = async () => {
    try {
      const response: ApiResponse<TAiPhoto[]> = await generatePhoto({
        id: businessId,
        prompt,
      }).unwrap();
      if (response && response.data) {
        dispatch(setPhotosAi(response.data));
        toast.success(response.message);
        setOpen(false);
        setPrompt("");
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Delete Photo",
      message: "Are you sure you want to delete this photo?",
    });
    if (ok) {
      try {
        const response: ApiResponse<null> = await deletePhoto(id).unwrap();
        if (response && response.success) {
          const refreshed: ApiResponse<TAiPhoto[]> = await getPhotos(businessId).unwrap();
          if (refreshed && refreshed.data) dispatch(setPhotosAi(refreshed.data));
          toast.success(response.message);
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      {/* Section 1 — Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">AI Photo</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      {/* Section 2 — Photo Grid */}
      <div className="p-5">
        {!photosAi || photosAi.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-sm">
            No photos generated yet
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
            {photosAi.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition h-80 bg-gray-200 p-5 flex justify-center items-center"
              >
                <img
                  src={photo.url}
                  className="w-auto h-auto max-w-full max-h-full"
                  alt={photo.prompt}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <div className="flex gap-5">
                    <button
                      onClick={() => {
                        setSelectedMedia([{ url: photo.url }]);
                        setOpenSliderDlg(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <ImagePlay size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, photo.id)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4 relative">
              <h2 className="text-lg font-semibold">Generate AI Photo</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setPrompt("");
                }}
                className="absolute right-0 text-white bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
              >
                <X size={20} strokeWidth={2} color="white" />
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the photo you want to generate..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SliderDlg
        open={openSliderDlg}
        onClose={() => setOpenSliderDlg(false)}
        medias={selectedMedia}
      />
    </div>
  );
}

export default AiPhoto;
