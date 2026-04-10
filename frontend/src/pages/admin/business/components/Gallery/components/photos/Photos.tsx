import React, { useState } from "react";
import { Trash2, ImagePlay, PenBox } from "lucide-react";
import { toast } from "react-toastify";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useGetPhotosMutation, useDeletePhotoMutation, useUpdatePhotoMutation } from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Components
import SliderDlg from "../../../../../../../components/sliderDlg/SliderDlg";
import PhotoEditDlg from "../photoEditDlg/PhotoEditDlg";
import { confirm } from "../../../../../../../components/confirmDlg/ConfirmDlg";

// Models
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import { TGalleryPhoto, TGalleryPhotoUpdate } from "../../../../../../../models/Gallery";

// Enum
import { GalleryType } from "../../../../../../../enum/GalleryType";

// Utils
import { showError } from "../../../../../../../utils/showError";
import { useParams } from "react-router-dom";

function Photos({ photos }: { photos: any[] }) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ openSliderDlg, setOpenSliderDlg ] = useState<any>(null);
  const [ selectedMedia, setSelectedMedia ] = useState<any>(null);

  const [ openPhotoEditDlg, setOpenPhotoEditDlg ] = useState(false);
  const [ selectedPhoto, setSelectedPhoto ]  = useState({
    id: "",
    type: GalleryType.Image,
    isActive: false,
    description: ""
  });

  const [ getPhotos ] = useGetPhotosMutation();
  const [ updatePhoto ] = useUpdatePhotoMutation();
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

  // Open Text Edit
  const openPhotoEdit = (photo: TGalleryPhotoUpdate) => {
    setSelectedPhoto({
      id: photo.id,
      type: photo.type,
      isActive: photo.isActive,
      description: photo.description
    });
    setOpenPhotoEditDlg(true);
  }

  // Save Text
  const savePhoto = async (value: TGalleryPhotoUpdate) => {
    setSelectedPhoto({
      id: value.id,
      type: value.type,
      isActive: value.isActive,
      description: value.description
    });
    setOpenPhotoEditDlg(false);

    const response: ApiResponse<TGalleryPhoto> = await updatePhoto({
      id: value.id,
      form: {
        type: value.type,
        isActive: value.isActive,
        description: value.description
      }
    }).unwrap();

    if(response && response?.data) {
      const responsePhotos: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();

      if(responsePhotos && responsePhotos.data) {
        dispatch(setGalleryPhotos(responsePhotos.data));
      }

      toast.success(response.message);
    }
  }

  return (
    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
      {photos.map(photo => (
        <div
          key={photo.id}
          className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition h-80 bg-gray-200 p-5 flex justify-center items-center"
        >
          <img
            src={photo.url}
            className="w-auto h-auto max-w-full max-h-full"
            alt={photo.description}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {!photo.isActive && !photo.isDefault && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                Inactive
              </span>
            )}

            {photo.isDefault && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                Default
              </span>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center flex-col">
            <div className="flex mb-3">
              {!photo.isDefault && (
                <button
                  onClick={() => openPhotoEdit(photo)}
                  className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg mr-5"
                >
                  <PenBox size={18} />
                </button>
              )}

              <button
                onClick={() => openSlider([{url: photo.url}])}
                className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
              >
                <ImagePlay size={18} />
              </button>

              {!photo.isDefault && (
                <button
                  onClick={(e) => openConfirmDlg(e, photo.id)}
                  className="opacity-0 group-hover:opacity-100 transition duration-300 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg ml-5"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>


            {photo.description && (
              <p className="opacity-0 group-hover:opacity-100 transition duration-300 text-white text-sm mb-4 max-w-[80%] line-clamp-2">
                {photo.description}
              </p>
            )}
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

      <PhotoEditDlg
        open={openPhotoEditDlg}
        photo={selectedPhoto}
        onClose={() => {
          setOpenPhotoEditDlg(false);
        }}
        onSave={(value: any) => {
          savePhoto(value)
        }}
      />
    </div>
  )
}

export default Photos;