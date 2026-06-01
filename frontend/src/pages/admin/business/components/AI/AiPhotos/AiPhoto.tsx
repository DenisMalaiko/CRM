import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, ImagePlay, Trash2, WandSparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import {
  useLazyGetAiPhotosQuery,
  useDeletePhotoMutation,
} from "../../../../../../store/gallery/galleryApi";
import { setAiPhotosGalleryPhotos } from "../../../../../../store/gallery/gallerySlice";

// Components
import { CreateAiPhotoDlg } from "./components/CreateAiPhotoDlg";
import { confirm } from "../../../../../../components/confirmDlg/ConfirmDlg";
import SliderDlg from "../../../../../../components/sliderDlg/SliderDlg";
import EditPhotoDlg from "../../../../../../components/editPhotoDlg/EditPhotoDlg";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../utils/showError";

// Enum
import { ContentType } from "../../../../../../enum/ContentType";

export function AiPhoto() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [open, setOpen] = useState(false);
  const [openSliderDlg, setOpenSliderDlg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string }[] | null>(null);
  const [openEditPhotoDlg, setOpenEditPhotoDlg] = useState<string | null>(null);

  const [getPhotos] = useLazyGetAiPhotosQuery();
  const [deletePhoto] = useDeletePhotoMutation();

  const { aiPhotos } = useAppSelector((state) => state.galleryModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
          if (response && response.data) dispatch(setAiPhotosGalleryPhotos(response.data));
        }
      } catch (error) {
        showError(error);
      }
    };
    fetchData();
  }, [businessId, dispatch]);

  if (!businessId) return null;

  const handleSuccess = async () => {
    if (!businessId) return;
    try {
      const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
      if (response && response.data) dispatch(setAiPhotosGalleryPhotos(response.data));
    } catch (error) {
      showError(error);
    }
  };

  const handleOpenSlider = (photo: TGalleryPhoto) => {
    setSelectedMedia([{ url: photo.url }]);
    setOpenSliderDlg(true);
  };

  const handleDownload = (photo: TGalleryPhoto) => {
    window.open(photo.url, '_blank');
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
          const refreshed: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
          if (refreshed && refreshed.data) dispatch(setAiPhotosGalleryPhotos(refreshed.data));
          toast.success(response.message);
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">AI Photo</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      <div className="p-5">
        {aiPhotos.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-sm">
            No photos generated yet
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
            {[...aiPhotos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition h-80 bg-gray-200 p-5 flex justify-center items-center"
              >
                <img
                  src={photo.url}
                  className="w-auto h-auto max-w-full max-h-full"
                  alt={photo.description}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <div className="flex gap-5">
                    <button
                      onClick={() => setOpenEditPhotoDlg(photo.id)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <WandSparkles size={18} />
                    </button>

                    <button
                      onClick={() => handleOpenSlider(photo)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <ImagePlay size={18} />
                    </button>

                    <button
                      onClick={() => handleDownload(photo)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <Download size={18} />
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

      <CreateAiPhotoDlg
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />

      <SliderDlg
        open={openSliderDlg}
        onClose={() => setOpenSliderDlg(false)}
        medias={selectedMedia ?? []}
      />

      <EditPhotoDlg
        open={!!openEditPhotoDlg}
        type={ContentType.GalleryPhoto}
        onClose={() => setOpenEditPhotoDlg(null)}
        photoId={openEditPhotoDlg ?? ''}
        onSuccess={handleSuccess}
      ></EditPhotoDlg>
    </div>
  );
}

export default AiPhoto;
