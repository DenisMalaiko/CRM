import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useGetPhotosMutation, useLazyGetDefaultPhotosQuery } from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos, setDefaultGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Models
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import { TDefaultGalleryPhoto, TGalleryPhoto } from "../../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../../utils/showError";
import { useAppSelector } from "../../../../../../../store/hooks";
import { GalleryType } from "../../../../../../../enum/GalleryType";
import { BusinessProfileFocus } from "../../../../../../../enum/BusinessProfileFocus";

type Props = {
  onSelect: (selectedPhotos: TGalleryPhoto[]) => void;
  selectedIds: string[];
  focus: BusinessProfileFocus;
}

export function SelectGalleryDlg({ onSelect, selectedIds, focus }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const MAX_SELECTED = 3;

  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<GalleryType | null>(null);

  const [getPhotos] = useGetPhotosMutation();
  const [getDefaultPhotos] = useLazyGetDefaultPhotosQuery();
  const { photos, defaultPhotos } = useAppSelector((state) => state.galleryModule);

  const mappedPhotos = photos.map((photo: TGalleryPhoto) => ({ ...photo, isDefault: false }));
  const mappedDefaultPhotos = defaultPhotos.map((photo: TDefaultGalleryPhoto) => ({ ...photo, isDefault: true }));
  const allPhotos = [...mappedDefaultPhotos, ...mappedPhotos] as TGalleryPhoto[];

  const decorationPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Decoration);
  const imagePhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Image);
  const postPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Post);
  const storyPhotos: TGalleryPhoto[] = allPhotos.filter((p: TGalleryPhoto) => p.type === GalleryType.Story);

  const hasPostOrStorySelected = localSelected.some(id => {
    const p = allPhotos.find(p => p.id === id);
    return p?.type === GalleryType.Post || p?.type === GalleryType.Story;
  });

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
          const responseDefault: ApiResponse<TDefaultGalleryPhoto[]> = await getDefaultPhotos().unwrap();

          if (response && response.data) dispatch(setGalleryPhotos(response.data));
          if (responseDefault && responseDefault.data) dispatch(setDefaultGalleryPhotos(responseDefault.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setLocalSelected(selectedIds);
  }, [selectedIds]);

  const toggle = (id: string) => {
    setLocalSelected(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= MAX_SELECTED ? prev : [...prev, id];
      onSelect(allPhotos.filter((p: TGalleryPhoto) => next.includes(p.id)));
      return next;
    });
  };

  if (!businessId) return null;

  const visibleCategories = [
    { type: GalleryType.Image, label: 'Images', photos: imagePhotos },
    ...(focus === BusinessProfileFocus.GeneratePosts ? [{ type: GalleryType.Post, label: 'Templates for Posts', photos: postPhotos }] : []),
    ...(focus === BusinessProfileFocus.GenerateStories ? [{ type: GalleryType.Story, label: 'Templates for Stories', photos: storyPhotos }] : []),
    { type: GalleryType.Decoration, label: 'Decorations', photos: decorationPhotos },
  ];

  const activeCategoryPhotos = activeCategory ? allPhotos.filter((p: TGalleryPhoto) => p.type === activeCategory) : [];
  const activeCategoryLabel = visibleCategories.find(c => c.type === activeCategory)?.label ?? '';

  return (
    <div>
      <div className="flex items-center gap-2 justify-between">
        <label className="block text-sm font-medium text-slate-700 text-left mb-3">
          Attach Photos
          {localSelected.length === MAX_SELECTED && <span className="ml-1 text-red-500">(max 3 photos)</span>}
        </label>
      </div>

      {activeCategory === null ? (
        <div className="flex gap-3">
          {visibleCategories.map(cat => (
            <div
              key={cat.type}
              onClick={() => setActiveCategory(cat.type)}
              className="cursor-pointer relative rounded-xl overflow-hidden transition"
            >
              {cat.photos.slice(-1).map(photo => (
                <div key={photo.id} className="relative h-48 w-40 bg-gray-200">
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl" />
                  <h3 className="absolute bottom-2 left-0 right-0 text-center text-xs font-semibold text-white uppercase tracking-wide px-2">
                    {cat.label}
                  </h3>
                </div>
              ))}

              {cat.photos.length === 0 && (
                <div className="h-48 w-36 bg-gray-200 rounded-xl flex flex-col items-center justify-end pb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {cat.label}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              {activeCategoryLabel}
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {activeCategoryPhotos.map(photo => (
              <div
                key={photo.id}
                className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-gray-200 h-48 w-40 flex-shrink-0 flex justify-center items-center snap-start"
              >
                <label className="relative cursor-pointer w-full h-full flex justify-center items-center">
                  <img
                    src={photo.url}
                    className="w-full h-full max-w-full max-h-full"
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
        </div>
      )}
    </div>
  );
}

