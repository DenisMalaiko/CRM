import { createPortal } from "react-dom"
import React, { useMemo, useState, useEffect } from 'react';
import {useParams} from "react-router-dom";
import { X } from "lucide-react";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useGetPhotosMutation, useLazyGetDefaultPhotosQuery } from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos, setDefaultGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Models
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import {TDefaultGalleryPhoto, TGalleryPhoto} from "../../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../../utils/showError";
import {useSelector} from "react-redux";
import {GalleryType} from "../../../../../../../enum/GalleryType";
import {BusinessProfileFocus} from "../../../../../../../enum/BusinessProfileFocus";

function SelectGalleryDlg({ open, onClose, onSelect, selectedIds, focus }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const MAX_SELECTED = 3

  const [ localSelected, setLocalSelected ] = useState<string[]>([])

  const [ getPhotos ] = useGetPhotosMutation();
  const [ getDefaultPhotos ] = useLazyGetDefaultPhotosQuery();
  const { photos, defaultPhotos } = useSelector((state: any) => state.galleryModule);

  const mappedPhotos = photos.map((photo: any) => ({ ...photo, isDefault: false }));
  const mappedDefaultPhotos = defaultPhotos.map((photo: any) => ({ ...photo, isDefault: true }));
  const allPhotos = [...mappedDefaultPhotos, ...mappedPhotos];

  const decorationPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Decoration);
  const imagePhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Image);
  const postPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Post);
  const storyPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Story);

  const hasPostOrStorySelected = localSelected.some(id => {
    const p = allPhotos.find(p => p.id === id)
    return p?.type === GalleryType.Post || p?.type === GalleryType.Story
  })

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
          const responseDefault: ApiResponse<TDefaultGalleryPhoto[]> = await getDefaultPhotos().unwrap();

          if(response && response.data) dispatch(setGalleryPhotos(response.data));
          if(responseDefault && responseDefault.data) dispatch(setDefaultGalleryPhotos(responseDefault.data));
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
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-auto">

        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between relative">
          <h2 className="text-lg font-semibold">Select Gallery Photo</h2>

          {/* Close */}
          <button
            onClick={() => onClose()}
            className="absolute top-3 right-3 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-10 p-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Images
                </h3>
              </div>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                {imagePhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-gray-200 p-3 h-60 flex justify-center items-center"
                  >
                    <label className="relative cursor-pointer w-full h-full flex justify-center items-center">
                      <img
                        src={photo.url}
                        className="w-auto h-auto max-w-full max-h-full"
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


        <div className="border-b px-6 py-4 flex items-center justify-between relative">
          <h2 className="text-lg font-semibold">Select Design System</h2>
        </div>

        <div className="flex-1 overflow-auto">
          {focus === BusinessProfileFocus.GeneratePosts && (
            <div className="space-y-10 p-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Templates For Posts
                  </h3>
                </div>

                <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                  {postPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-gray-200 p-3 h-60 flex justify-center items-center"
                    >
                      <label className="relative cursor-pointer w-full h-full flex justify-center items-center">
                        <img
                          src={photo.url}
                          className="w-auto h-auto max-w-full max-h-full"
                          alt=""
                        />

                        <div className="absolute top-3 right-3 duration-300">
                          <input
                            type="checkbox"
                            checked={localSelected.includes(photo.id)}
                            disabled={
                              (!localSelected.includes(photo.id) && localSelected.length >= MAX_SELECTED) ||
                              (
                                hasPostOrStorySelected &&
                                (photo.type === GalleryType.Post || photo.type === GalleryType.Story) &&
                                !localSelected.includes(photo.id)
                              )
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
          )}

          {focus === BusinessProfileFocus.GenerateStories && (
            <div className="space-y-10 p-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Templates For Stories
                  </h3>
                </div>

                <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                  {storyPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-gray-200 p-3 h-60 flex justify-center items-center"
                    >
                      <label className="relative cursor-pointer w-full h-full flex justify-center items-center">
                        <img
                          src={photo.url}
                          className="w-auto h-auto max-w-full max-h-full"
                          alt=""
                        />

                        <div className="absolute top-3 right-3 duration-300">
                          <input
                            type="checkbox"
                            checked={localSelected.includes(photo.id)}
                            disabled={
                              (!localSelected.includes(photo.id) && localSelected.length >= MAX_SELECTED) ||
                              (
                                hasPostOrStorySelected &&
                                (photo.type === GalleryType.Post || photo.type === GalleryType.Story) &&
                                !localSelected.includes(photo.id)
                              )
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
          )}

          <div className="space-y-10 p-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Decorations
                </h3>
              </div>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                {decorationPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-gray-200 p-3 h-60 flex justify-center items-center"
                  >
                    <label className="relative cursor-pointer w-full h-full flex justify-center items-center">
                      <img
                        src={photo.url}
                        className="w-auto h-auto max-w-full max-h-full"
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
                allPhotos.filter((p: TGalleryPhoto) => localSelected.includes(p.id))
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