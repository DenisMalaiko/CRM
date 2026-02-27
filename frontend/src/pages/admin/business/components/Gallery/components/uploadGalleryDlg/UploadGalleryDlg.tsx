import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import { X, Trash2 } from "lucide-react";

// Hooks
import { useForm } from "../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../hooks/useValidation";

// Components
import { confirm } from "../../../../../../../components/confirmDlg/ConfirmDlg";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import {
  useUploadPhotosMutation,
  useGetPhotosMutation
} from "../../../../../../../store/gallery/galleryApi";
import { setGalleryPhotos } from "../../../../../../../store/gallery/gallerySlice";

// Enum
import { GalleryType } from "../../../../../../../enum/GalleryType";

// Utils
import { showError } from "../../../../../../../utils/showError";
import { isBoolean, isRequired, isValidPhoto } from "../../../../../../../utils/validations";
import { ChangeArg, isNativeEvent } from "../../../../../../../utils/isNativeEvent";

// Models
import {TGalleryPhoto, TGalleryPhotoPreview} from "../../../../../../../models/Gallery";
import {ApiResponse} from "../../../../../../../models/ApiResponse";


function UploadGalleryDlg({ open, onClose }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ photos, setPhotos ] = useState<TGalleryPhotoPreview[]>([]);

  const [ uploadPhotos, { isLoading } ] = useUploadPhotosMutation();
  const [ getPhotos ] = useGetPhotosMutation();

  const TypesList = [GalleryType.Image];

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, []);

  // Init Form
  const initialForm = useMemo(() => {
    return {
      type: GalleryType.Image,
      isActive: true,
      businessId: businessId ?? "",
    }
  }, [businessId]);

  // Form Hook
  const { form, handleChange } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    type: (value) => isRequired(value),
    isActive: (value) => isBoolean(value),
    businessId: (value) => isRequired(value),
  })

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

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  const onChangePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 overflow-hidden">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ "Upload" } Photos</h2>

          <button
            onClick={onClose}
            className="top-3 right-3 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        <form className="space-y-4" onSubmit={upload} action="">
          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Type</label>
            </div>

            <select
              name="type"
              value={form.type}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { TypesList.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              )) }
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-2 text-left">{errors.type}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Upload Photos</label>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="photo"
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2
                    rounded-lg
                    bg-blue-600 text-white
                    text-sm font-medium
                    cursor-pointer
                    hover:bg-bg-blue-700
                    transition
                    focus-within:ring-2 focus-within:ring-slate-400
                  "
                >
                  📁 Upload photos
                </label>

                <input
                  type="file"
                  name="photo"
                  id="photo"
                  className="hidden"
                  accept="image/*"
                  multiple={true}
                  onChange={onChangePhotos}
                />
              </div>
            </div>
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


          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Photo</span>
          </label>

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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Saving...
                </>
              ) : ("Save")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadGalleryDlg;
