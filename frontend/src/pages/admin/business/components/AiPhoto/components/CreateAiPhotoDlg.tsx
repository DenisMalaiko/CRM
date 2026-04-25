import React, { useState } from 'react';
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useGenerateAiPhotoMutation } from "../../../../../../store/gallery/galleryApi";

// Components
import { SelectGalleryDlg } from "../../Gallery/components/selectGalleryDlg/SelectGalleryDlg";

// Models
import { TGalleryPhoto } from "../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../utils/showError";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAiPhotoDlg({ open, onClose, onSuccess }: Props) {
  const { businessId } = useParams<{ businessId: string }>();

  const [form, setForm] = useState({
    prompt: '',
    photosIds: [] as string[],
    defaultPhotosIds: [] as string[],
  });

  const [generatePhoto, { isLoading }] = useGenerateAiPhotoMutation();

  if (!open) return null;
  if (!businessId) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await generatePhoto({
        id: businessId,
        form: {
          prompt: form.prompt,
          photosIds: form.photosIds,
          defaultPhotosIds: form.defaultPhotosIds,
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

  const handleSelectPhotos = (selectedPhotos: TGalleryPhoto[]) => {
    const photosIds = selectedPhotos.filter(p => !p.isDefault).map(p => p.id);
    const defaultPhotosIds = selectedPhotos.filter(p => p.isDefault).map(p => p.id);
    setForm(prev => ({ ...prev, photosIds, defaultPhotosIds }));
  };

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
            <textarea
              value={form.prompt}
              onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Describe the photo you want to generate..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SelectGalleryDlg
            focus={null}
            selectedIds={[...form.photosIds, ...form.defaultPhotosIds]}
            onSelect={handleSelectPhotos}
          />

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

export default CreateAiPhotoDlg;
