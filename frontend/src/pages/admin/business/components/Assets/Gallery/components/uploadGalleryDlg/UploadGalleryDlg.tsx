import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { X, Trash2, Upload } from "lucide-react";

// Hooks
import { useForm } from "../../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../../../store/hooks";
import {
  useUploadPhotosMutation,
  useGetPhotosMutation
} from "../../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../../../../store/gallery/gallerySlice";

// Enum
import { GalleryType } from "../../../../../../../../enum/GalleryType";

// Utils
import { showError } from "../../../../../../../../utils/showError";
import { isBoolean, isRequired, isValidPhoto } from "../../../../../../../../utils/validations";

// Models
import { TGalleryPhoto, TGalleryPhotoPreview } from "../../../../../../../../models/Gallery";
import { ApiResponse } from "../../../../../../../../models/ApiResponse";


function UploadGalleryDlg({ open, onClose, focus }: any) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ photos, setPhotos ] = useState<TGalleryPhotoPreview[]>([]);
  const [ isDragging, setIsDragging ] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ uploadPhotos, { isLoading } ] = useUploadPhotosMutation();
  const [ getPhotos ] = useGetPhotosMutation();


  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, []);

  // Init Form
  const initialForm = useMemo(() => {
    return {
      type: focus === "Gallery" ? GalleryType.Image : focus === "Decorations" ? GalleryType.Decoration : GalleryType.Post,
      isActive: true,
      businessId: businessId ?? "",
    }
  }, [businessId]);

  // Form Hook
  const { form } = useForm(initialForm);

  // Validation Hook
  const { validateAll } = useValidation<typeof form>({
    type: (value) => isRequired(value),
    isActive: (value) => isBoolean(value),
    businessId: (value) => isRequired(value),
  })

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: TGalleryPhotoPreview[] = [];

    Array.from(files).forEach((file) => {
      try {
        isValidPhoto(file);
        newPhotos.push({
          file,
          preview: URL.createObjectURL(file),
        });
      } catch (error) {
        showError(error);
      }
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  if (!open) return null;
  if (!businessId) return null;

  // Upload Photo
  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const formData = new FormData();

      formData.append('type', form.type as string);
      formData.append('isActive', form.isActive ? "true" : "false");
      formData.append('businessId', form.businessId ?? "");

      photos.forEach((photo) => {
        formData.append('files', photo.file);
      });

      const response: ApiResponse<{ count: number } | []> = await uploadPhotos(formData).unwrap();
      if(response && response?.data) toast.success(response.message);

      const responsePhotos: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
      dispatch(setGalleryPhotos(responsePhotos.data ?? []))
      onClose()
      setPhotos([])
    } catch (error) {
      showError(error);
    }
  }

  const onChangePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 overflow-hidden">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t("UploadPhotos.Title")}</h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={upload} action="">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition
              ${isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
              }
            `}
          >
            <div className={`rounded-full p-3 ${isDragging ? "bg-blue-100" : "bg-slate-200"}`}>
              <Upload size={24} className={isDragging ? "text-blue-600" : "text-slate-500"} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                {t("UploadPhotos.DragDrop")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t("UploadPhotos.OrClick")}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={onChangePhotos}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded-lg border"
                />


                <button
                  onClick={() => removePhoto(index)}
                  className="
                    absolute top-1 right-1
                    text-white text-xl z-10 bg-red-600 rounded-full
                    p-2 hover:bg-red-700 cursor-pointer
                    opacity-0 group-hover:opacity-100 transition
                    "
                >
                  <Trash2 size={20} strokeWidth={2} color="white"></Trash2>
                </button>
              </div>
            ))}
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg border  text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
            >
              {t("UploadPhotos.Cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  {t("UploadPhotos.Saving")}
                </>
              ) : (t("UploadPhotos.Save"))
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadGalleryDlg;
