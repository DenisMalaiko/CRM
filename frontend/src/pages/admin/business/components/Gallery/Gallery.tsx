import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { showError } from "../../../../../utils/showError";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetPhotosMutation, useDeletePhotoMutation,  } from "../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../store/gallery/gallerySlice";

// Components
import UploadGalleryDlg from "./components/uploadGalleryDlg/UploadGalleryDlg"
import Photos from "./components/photos/Photos"

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../models/Gallery";
import { GalleryType } from "../../../../../enum/GalleryType";

function Gallery() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ open, setOpen ] = useState(false);
  const [ selectedPhoto, setSelectedPhoto ] = useState<File | null>(null);

  const [ getPhotos ] = useGetPhotosMutation();
  const { photos } = useSelector((state: any) => state.galleryModule);

  const decorationPhotos = photos.filter((p: TGalleryPhoto) => p.type === GalleryType.Decoration);
  const imagePhotos = photos.filter((p: TGalleryPhoto) => p.type === GalleryType.Image);

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();

          if(response && response.data) {
            dispatch(setGalleryPhotos(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

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

        <div className="p-5 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Images assets
              </h3>
            </div>

            <Photos photos={imagePhotos}/>
          </section>
        </div>
      </section>
    </div>
  )
}

export default Gallery;