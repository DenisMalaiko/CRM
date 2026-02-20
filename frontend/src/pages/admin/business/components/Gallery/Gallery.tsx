import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { showError } from "../../../../../utils/showError";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetPhotosMutation, useDeletePhotoMutation,  } from "../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../store/gallery/gallerySlice";

// Components
import UploadGalleryDlg from "./uploadGalleryDlg/UploadGalleryDlg"
import {confirm} from "../../../../../components/confirmDlg/ConfirmDlg";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../models/Gallery";

function Gallery() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ open, setOpen ] = useState(false);
  const [ selectedPhoto, setSelectedPhoto ] = useState<File | null>(null);

  const [ getPhotos ] = useGetPhotosMutation();
  const [ deletePhoto ] = useDeletePhotoMutation();
  const { photos } = useSelector((state: any) => state.galleryModule);

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();

          console.log("RESPONSE GALLERY: ", response.data)

          if(response && response.data) {
            dispatch(setGalleryPhotos(response.data));
            console.log("RESPONSE GALLERY: ", response)
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

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

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Gallery</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Upload Photo
          </button>

          <UploadGalleryDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedPhoto(null);
            }}
            photo={selectedPhoto}
          ></UploadGalleryDlg>
        </div>

        {photos.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            <span className="text-gray-400">No data</span>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {photos.map((photo: any) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
                >
                  <img
                    src={photo.url}
                    alt="Business gallery"
                    className="w-full h-48 object-cover"
                  />

                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className="bg-white/80 backdrop-blur text-xs px-2 py-1 rounded-md text-gray-700 shadow">
                      {photo.type}
                    </span>

                    {!photo.isActive && (
                      <span className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-md shadow">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => openConfirmDlg(e, photo.id)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Date */}
                  <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md text-gray-700">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Gallery;