import React, {useState} from 'react';
import {X} from "lucide-react";
import {toast} from "react-toastify";

// Hooks
import {showError} from "../../utils/showError";

// Redux
import {
  useRegeneratePhotoMutation,
  useRevertOriginalMutation,
  useRevertPreviousMutation
} from "../../store/gallery/galleryApi";

import {
  useRegenerateCreativeMutation,
  useRevertCreativeOriginalMutation,
  useRevertCreativePreviousMutation,
} from "../../store/artifact/artifactApi";


// Models
import { ApiResponse } from "../../models/ApiResponse";
import { TGalleryPhoto } from "../../models/Gallery";
import { TAIArtifact } from "../../models/AIArtifact";

// Enum
import { ContentType } from "../../enum/ContentType";


type Props = {
  open: boolean;
  type: ContentType
  photoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function EditPhotoDlg({ open, type, onClose, onSuccess, photoId }: Props) {
  const [ regeneratePhoto, { isLoading } ] = useRegeneratePhotoMutation();
  const [ revertOriginal, { isLoading: isReturningOriginalLoading } ] = useRevertOriginalMutation();
  const [ revertPrevious, { isLoading: isReturningPreviousLoading } ] = useRevertPreviousMutation();

  const [ regenerateCreative, { isLoading: isRegeneratingCreativeLoading } ] = useRegenerateCreativeMutation();
  const [ revertCreativeOriginal, { isLoading: isRevertingCreativeOriginalLoading } ] = useRevertCreativeOriginalMutation();
  const [ revertCreativePrevious, { isLoading: isRevertingCreativePreviousLoading } ] = useRevertCreativePreviousMutation();

  const isAnyLoading = isLoading || isReturningOriginalLoading || isReturningPreviousLoading || isRegeneratingCreativeLoading || isRevertingCreativeOriginalLoading || isRevertingCreativePreviousLoading;

  // Init Form
  const [form, setForm] = useState({
    prompt: ""
  });

  if (!open) return null;

  const editPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let response: ApiResponse<TGalleryPhoto | TAIArtifact> | undefined;

      if(type === ContentType.GalleryPhoto) {
        response = await regeneratePhoto({ id: photoId, form }).unwrap();
      }

      if(type === ContentType.AiArtifact) {
        response = await regenerateCreative({ id: photoId, form }).unwrap();
      }

      if(response && response?.data) {
        toast.success(response.message);
        setForm({ prompt: "" });
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError(error)
    }
  }

  const revertToOriginal = async () => {
    try {
      let response: ApiResponse<TGalleryPhoto | TAIArtifact> | undefined;

      if(type === ContentType.GalleryPhoto) {
        response = await revertOriginal(photoId).unwrap();
      }

      if(type === ContentType.AiArtifact) {
        response = await revertCreativeOriginal(photoId).unwrap();
      }

      if(response && response?.data) {
        toast.success(response.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError(error)
    }
  }

  const revertToPrevious = async () => {
    try {
      let response: ApiResponse<TGalleryPhoto | TAIArtifact> | undefined;

      if(type === ContentType.GalleryPhoto) {
        response = await revertPrevious(photoId).unwrap();
      }

      if(type === ContentType.AiArtifact) {
        response = await revertCreativePrevious(photoId).unwrap();
      }

      if(response && response?.data) {
        toast.success(response.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError(error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-lg font-semibold">Edit Photo</h2>

          {/* Close */}
          <button
            onClick={() => onClose()}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        <form className="space-y-4" onSubmit={editPhoto} action="">
          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">Prompt</label>
            </div>

            <textarea
              rows={3}
              value={form.prompt}
              onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Enter prompt..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={isAnyLoading}
              className="px-4 py-2 rounded-lg border  text-slate-600 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => revertToOriginal()}
              disabled={isAnyLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              { (isReturningOriginalLoading || isRevertingCreativeOriginalLoading) ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Reverting...
                </>
                ) : ("Revert to original")
              }
            </button>

            <button
              type="button"
              onClick={() => revertToPrevious()}
              disabled={isAnyLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              { (isReturningPreviousLoading || isRevertingCreativePreviousLoading) ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Reverting...
                </>
                ) : ("Revert to previous")
              }
            </button>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              { (isLoading || isRegeneratingCreativeLoading ) ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Editing...
                </>
              ) : ("Edit")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPhotoDlg;
