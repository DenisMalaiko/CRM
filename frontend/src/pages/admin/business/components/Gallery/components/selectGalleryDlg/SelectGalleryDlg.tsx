import { createPortal } from "react-dom"
import React, { useMemo, useState, useEffect } from 'react';
import {useParams} from "react-router-dom";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useGetPhotosMutation } from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Models
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../../utils/showError";
import {useSelector} from "react-redux";
import {GalleryType} from "../../../../../../../enum/GalleryType";


function SelectGalleryDlg({ open, onClose, onSelect, selectedIds }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const MAX_SELECTED = 3

  const [ localSelected, setLocalSelected ] = useState<string[]>([])

  const [ getPhotos ] = useGetPhotosMutation();
  const { photos } = useSelector((state: any) => state.galleryModule);

  const postPhotos: TGalleryPhoto[] = photos.filter((p: TGalleryPhoto) => p.type === GalleryType.Post);
  const imagePhotos: TGalleryPhoto[] = photos.filter((p: TGalleryPhoto) => p.type === GalleryType.Image);

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

  useEffect(() => {
    setLocalSelected(selectedIds)
  }, [selectedIds])

  const toggle = (id: string) => {
    setLocalSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }

      if (prev.length >= MAX_SELECTED) {
        return prev
      }

      return [...prev, id]
    })
  }

  if (!open) return null
  if(!businessId) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Gallery Photo</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* тут grid з фото */}

          <div className="space-y-10 border-b p-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Post images
                </h3>
              </div>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {postPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                  >
                    <label className="relative cursor-pointer">
                      <img
                        src={photo.url}
                        className="w-full h-40 object-cover"
                        alt=""
                      />

                      <div className="absolute top-3 right-3 duration-300">
                        <input
                          type="checkbox"
                          checked={localSelected.includes(photo.id)}
                          disabled={
                            !localSelected.includes(photo.id) &&
                            localSelected.length >= MAX_SELECTED
                          }
                          onChange={() => toggle(photo.id)}
                          className="h-4 w-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-10 p-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Images assets
                </h3>
              </div>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {imagePhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                  >
                    <label className="relative cursor-pointer">
                      <img
                        src={photo.url}
                        className="w-full h-40 object-cover"
                        alt=""
                      />

                      <div className="absolute top-3 right-3 duration-300">
                        <input
                          type="checkbox"
                          checked={localSelected.includes(photo.id)}
                          disabled={
                            !localSelected.includes(photo.id) &&
                            localSelected.length >= MAX_SELECTED
                          }
                          onChange={() => toggle(photo.id)}
                          className="h-4 w-4 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={localSelected.length === 0}
            onClick={() =>
              onSelect(
                photos.filter((p: TGalleryPhoto) => localSelected.includes(p.id))
              )
            }
          >
            Select ({localSelected.length}/{MAX_SELECTED})
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}

export default SelectGalleryDlg