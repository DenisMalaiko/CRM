import React, { useEffect, useState } from "react";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store/hooks";
import { useLazyGetDefaultPhotosQuery } from "../../../store/gallery/galleryApi";
import { setDefaultGalleryPhotos } from "../../../store/gallery/gallerySlice";

// Components
import UploadDefaultGalleryPhotoDlg from "./components/uploadDefaultGalleryPhotoDlg/UploadDefaultGalleryPhotoDlg";
import DefaultGalleryPhotos from "./components/defaultGalleryPhotos/DefaultGalleryPhotos";

// Utils
import { showError } from "../../../utils/showError";

// Models
import { ApiResponse } from "../../../models/ApiResponse";
import { TDefaultGalleryPhoto } from "../../../models/Gallery";
import { GalleryType } from "../../../enum/GalleryType";

function AdminGallery() {
  const dispatch = useAppDispatch();

  const [ open, setOpen ] = React.useState(false);
  const [ selectedPhoto, setSelectedPhoto ] = useState<File | null>(null);

  const [ getPhotos ] = useLazyGetDefaultPhotosQuery();
  const { defaultPhotos } = useSelector((state: any) => state.galleryModule);

  const decorationPhotos = defaultPhotos?.filter((p: TDefaultGalleryPhoto) => p.type === GalleryType.Decoration);
  const imagePhotos = defaultPhotos?.filter((p: TDefaultGalleryPhoto) => p.type === GalleryType.Image);
  const postPhotos = defaultPhotos?.filter((p: TDefaultGalleryPhoto) => p.type === GalleryType.Post);
  const storyPhotos = defaultPhotos?.filter((p: TDefaultGalleryPhoto) => p.type === GalleryType.Story);

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: ApiResponse<TDefaultGalleryPhoto[]> = await getPhotos().unwrap();

        if(response && response.data) {
          dispatch(setDefaultGalleryPhotos(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

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

          <UploadDefaultGalleryPhotoDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedPhoto(null);
            }}
            photo={selectedPhoto}
          ></UploadDefaultGalleryPhotoDlg>
        </div>

        <div className="p-5 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Posts
              </h3>
            </div>

            <DefaultGalleryPhotos photos={postPhotos}/>
          </section>
        </div>

        <div className="p-5 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Stories
              </h3>
            </div>

            <DefaultGalleryPhotos photos={storyPhotos}/>
          </section>
        </div>


        <div className="p-5 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Images
              </h3>
            </div>

            <DefaultGalleryPhotos photos={imagePhotos}/>
          </section>
        </div>

        <div className="p-5 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Decorations
              </h3>
            </div>

            <DefaultGalleryPhotos photos={decorationPhotos}/>
          </section>
        </div>
      </section>
    </div>
  )
}


export default AdminGallery;