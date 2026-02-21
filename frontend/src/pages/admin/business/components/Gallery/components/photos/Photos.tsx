import React, { useState } from "react";
import { Trash2, ImagePlay } from "lucide-react";
import { toast } from "react-toastify";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useGetPhotosMutation, useDeletePhotoMutation,  } from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Components
import SliderDlg from "../../../../../../../components/sliderDlg/SliderDlg";
import { confirm } from "../../../../../../../components/confirmDlg/ConfirmDlg";

// Models
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../../utils/showError";
import { useParams } from "react-router-dom";

function Photos({ photos }: { photos: any[] }) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ openSliderDlg, setOpenSliderDlg ] = useState<any>(null);
  const [ selectedMedia, setSelectedMedia ] = useState<any>(null);

  const [ getPhotos ] = useGetPhotosMutation();
  const [ deletePhoto ] = useDeletePhotoMutation();

  if(!businessId) return null;

  if (photos.length === 0) {
    return (
      <div className="py-4 text-center text-slate-400 text-sm">
        No photos
      </div>
    )
  }

  const openConfirmDlg = async (e: any, id: string) => {
    console.log("Delete ", id);

    e.preventDefault();

    const ok = await confirm({
      title: "Delete Gallery Photo",
      message: "Are you sure you want to delete this photo?",
    });

    if(ok) {
      try {
        if (id != null) {
          const responseDeleted: ApiResponse<null> = await deletePhoto(id).unwrap();

          if(responseDeleted && responseDeleted?.success) {
            const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();

            if(response && response?.data) {
              dispatch(setGalleryPhotos(response.data));
            }

            toast.success(responseDeleted.message);
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

  return (
    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {photos.map(photo => (
        <div
          key={photo.id}
          className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
        >
          <img
            src={photo.url}
            className="w-full h-48 object-cover"
            alt=""
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {!photo.isActive && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                Inactive
              </span>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
            <button
              onClick={() => openSlider([{url: photo.url}])}
              className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg mr-5"
            >
              <ImagePlay size={18} />
            </button>

            <button
              onClick={(e) => openConfirmDlg(e, photo.id)}
              className="opacity-0 group-hover:opacity-100 transition duration-300 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <SliderDlg
        open={openSliderDlg}
        onClose={() => {
          setOpenSliderDlg(false);
        }}
        medias={selectedMedia}
      />
    </div>
  )
}

export default Photos;