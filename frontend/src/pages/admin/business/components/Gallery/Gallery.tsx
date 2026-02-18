import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {showError} from "../../../../../utils/showError";

// Redux
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetPhotosMutation } from "../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../store/gallery/gallerySlice";

// Components
import UploadGalleryDlg from "./uploadGalleryDlg/UploadGalleryDlg"
import {useSelector} from "react-redux";

function Gallery() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ open, setOpen ] = useState(false);
  const [ selectedPhoto, setSelectedPhoto ] = useState<File | null>(null);

  const [ getPhotos ] = useGetPhotosMutation();
  const { photos } = useSelector((state: any) => state.galleryModule);

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response = await getPhotos(businessId).unwrap();

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
      </section>
    </div>
  )
}

export default Gallery;