import React, { useState, useEffect, useMemo } from 'react';
import { X, Pencil } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";
import { useGetPhotosMutation, useLazyGetDefaultPhotosQuery } from "../../../../../../store/gallery/galleryApi";


// Components
import { SelectGalleryDlg } from "../../Gallery/components/selectGalleryDlg/SelectGalleryDlg";
import {BusinessProfileFocus} from "../../../../../../enum/BusinessProfileFocus";
import {TGalleryPhoto} from "../../../../../../models/Gallery";

type Props = {
  open: boolean;
  onClose: () => void;
};

function CreateAiPhoto({ open, onClose }: Props) {
  if (!open) return null;

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("CREATE AI PHOTO")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">Create AI Photo</h2>

          {/* Close */}
          <button
            onClick={() => onClose()}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        <form className="space-y-4" onSubmit={create} action="">

          {/*<SelectGalleryDlg
            focus={focus as BusinessProfileFocus}
            selectedIds={[...form.photosIds, ...form.defaultPhotosIds]}
            onSelect={(selectedPhotos: TGalleryPhoto[]) => {
              const businessIds = selectedPhotos.filter(p => !p.isDefault).map(p => p.id);
              const defaultIds = selectedPhotos.filter(p => p.isDefault).map(p => p.id);
              setForm(prev => ({ ...prev, photosIds: businessIds, defaultPhotosIds: defaultIds }));
            }}
          />*/}
        </form>
      </div>
    </div>
  )
}

export default CreateAiPhoto;