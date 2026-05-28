import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useAppDispatch, useAppSelector } from "../../../../../../../store/hooks";
import { useGenerateAiPhotoMutation } from "../../../../../../../store/gallery/galleryApi";
import { useGetPhotosMutation, useLazyGetDefaultPhotosQuery } from "../../../../../../../store/gallery/galleryApi";
import {
  setDefaultGalleryPhotos,
  setGalleryPhotos
} from "../../../../../../../store/gallery/gallerySlice";


// Components
import { SelectGalleryDlg } from "../../../Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg";

// Models
import { TDefaultGalleryPhoto, TGalleryPhoto } from "../../../../../../../models/Gallery";

// Enum
import { GalleryType } from "../../../../../../../enum/GalleryType";

// Utils
import { showError } from "../../../../../../../utils/showError";

const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9' },
  { value: '4:5',  label: '4:5'  },
  { value: '1:1',  label: '1:1'  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAiPhotoDlg({ open, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getPhotos ] = useGetPhotosMutation();
  const [ getDefaultPhotos ] = useLazyGetDefaultPhotosQuery();
  const [ generatePhoto, { isLoading }] = useGenerateAiPhotoMutation();

  const { photos, defaultPhotos } = useAppSelector((state) => state.galleryModule);

  const mappedPhotos = photos.map((photo: TGalleryPhoto) => ({ ...photo, isDefault: false }));
  const mappedDefaultPhotos = defaultPhotos.map((photo: TDefaultGalleryPhoto) => ({ ...photo, isDefault: true }));
  const allPhotos = [...mappedDefaultPhotos, ...mappedPhotos] as TGalleryPhoto[];

  const [form, setForm] = useState({
    businessId: businessId!,
    type: GalleryType.AI,
    isActive: true,
    prompt: '',
    photosIds: [] as string[],
    defaultPhotosIds: [] as string[],
    aspectRatio: '1:1',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const responsePhotos = await getPhotos(businessId).unwrap();
          const responseDefaultPhotos = await getDefaultPhotos().unwrap();

          if (responsePhotos && responsePhotos.data) dispatch(setGalleryPhotos(responsePhotos.data));
          if (responseDefaultPhotos && responseDefaultPhotos.data) dispatch(setDefaultGalleryPhotos(responseDefaultPhotos.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch, businessId, getPhotos, getDefaultPhotos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      const response = await generatePhoto({
        id: businessId,
        form: {
          businessId: form.businessId,
          type: form.type,
          isActive: form.isActive,
          prompt: form.prompt,
          photosIds: form.photosIds,
          defaultPhotosIds: form.defaultPhotosIds,
          aspectRatio: form.aspectRatio,
        },
      }).unwrap();

      if (response && response.data) {
        toast.success(response.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  };

  const deleteImage = (imageId?: string) => {
    setForm(prev => ({
      ...prev,
      photosIds: prev.photosIds.filter((id: string) => id !== imageId),
      defaultPhotosIds: prev.defaultPhotosIds.filter((id: string) => id !== imageId)
    }))
  }

  if (!open) return null;
  if (!businessId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">

        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">Generate AI Photo</h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">Prompt</label>
            </div>

            <div className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus-within:ring-2 outline-none">
              {allPhotos.filter((x: TGalleryPhoto) =>
                form.photosIds.includes(x.id) ||
                form.defaultPhotosIds.includes(x.id)
              ).length > 0 && (
                <div className="grid grid-cols-8 gap-2 mb-5">
                  {allPhotos.filter((x: TGalleryPhoto) =>
                    form.photosIds.includes(x.id) ||
                    form.defaultPhotosIds.includes(x.id)
                  ).map((photo: TGalleryPhoto) => (
                    <div key={photo.id} className="relative w-full aspect-square rounded-lg overflow-hidden border group bg-gray-200">
                      <img src={photo.url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => deleteImage(photo.id)}
                        className="absolute top-1 right-1 z-10 bg-blue-600 rounded-full p-1 hover:bg-blue-700 cursor-pointer"
                      >
                        <X size={12} strokeWidth={2} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={form.prompt}
                onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
                className="w-full resize-none outline-none text-sm bg-transparent"
                rows={3}
                placeholder="Enter prompt..."
              />
            </div>
          </div>

          <SelectGalleryDlg
            focus={null}
            selectedIds={[...form.photosIds, ...form.defaultPhotosIds]}
            onSelect={(selectedPhotos: TGalleryPhoto[]) => {
              const businessIds = selectedPhotos.filter(p => !p.isDefault).map(p => p.id);
              const defaultIds = selectedPhotos.filter(p => p.isDefault).map(p => p.id);
              setForm(prev => ({ ...prev, photosIds: businessIds, defaultPhotosIds: defaultIds }));
            }}
          />

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 text-left mb-1">Aspect Ratio</label>
            <div className="flex gap-3">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <label key={option.value} className="cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value={option.value}
                    checked={form.aspectRatio === option.value}
                    onChange={() => setForm(prev => ({ ...prev, aspectRatio: option.value }))}
                    className="hidden peer"
                  />
                  <div className="p-3 border rounded-xl text-center text-sm font-medium transition-all border-gray-300 hover:border-gray-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-md text-gray-700 peer-checked:text-blue-600">
                    {option.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!form.prompt.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
