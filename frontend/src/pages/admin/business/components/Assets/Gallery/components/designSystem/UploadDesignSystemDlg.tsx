import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Upload } from "lucide-react";
import { showError } from "../../../../../../../../utils/showError";
import { isValidPhoto } from "../../../../../../../../utils/validations";
import { useAppDispatch } from "../../../../../../../../store/hooks";
import { useCreateDesignSystemFromPhotoMutation } from "../../../../../../../../store/designSystem/designSystemApi";
import { addBusinessSystem } from "../../../../../../../../store/designSystem/designSystemSlice";

type Props = {
  open: boolean;
  onClose: () => void;
};

function UploadDesignSystemDlg({ open, onClose }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [createFromPhoto, { isLoading }] = useCreateDesignSystemFromPhotoMutation();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      isValidPhoto(selected);
    } catch (err) {
      showError(err);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleRemovePhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    handleRemovePhoto();
    setName("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !businessId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessId);
    if (name.trim()) {
      formData.append("name", name.trim());
    }

    try {
      const res = await createFromPhoto(formData).unwrap();
      if (res?.data) {
        dispatch(addBusinessSystem(res.data));
        toast.success(t('DesignSystem.uploadSuccess'));
        handleClose();
      }
    } catch (err) {
      showError(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {t('DesignSystem.uploadTitle')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full bg-blue-600 p-1.5 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="ds-name"
              className="block text-sm text-left font-medium text-slate-700 mb-1"
            >
              {t('DesignSystem.uploadName')}
            </label>
            <input
              id="ds-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('DesignSystem.uploadNamePlaceholder')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <span className="block text-sm text-left font-medium text-slate-700 mb-1">
              {t('DesignSystem.uploadPhoto')}
            </span>
            {preview && file ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Design system preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  aria-label="Remove photo"
                >
                  <X size={14} color="white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <Upload size={32} className="text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-500">
                  {t('DesignSystem.uploadChoose')}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {t('DesignSystem.uploadHint')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {t('DesignSystem.uploadAiHint')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              {t('DesignSystem.uploadCancel')}
            </button>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isLoading ? t('DesignSystem.uploadAnalyzing') : t('DesignSystem.uploadCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDesignSystemDlg;
