import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { TDefaultGalleryPhotoUpdate } from "../../../../../models/Gallery";
import { GalleryType } from "../../../../../enum/GalleryType";

type Props = {
  open: boolean;
  photo: TDefaultGalleryPhotoUpdate;
  onClose: () => void;
  onSave: (value: TDefaultGalleryPhotoUpdate) => void;
}

function EditDefaultGalleryPhotoDlg({ open, photo, onClose, onSave }: Props) {
  const [value, setValue] = useState<TDefaultGalleryPhotoUpdate>(photo);
  const TypeList = Object.values(GalleryType);

  useEffect(() => {
    if (open) {
      setValue(photo);
    }
  }, [open, photo]);

  if (!open) return null;

  const updateField = (field: keyof TDefaultGalleryPhotoUpdate, val: string | boolean) => {
    setValue((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl relative max-h-[90vh] overflow-auto">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Add Description</h2>

          <button
            onClick={() => onClose()}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        {/* Text */}
        <div className="p-6">

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 text-left">
              Type
            </label>

            <select
              name="type"
              value={value.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {TypeList.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>


          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 text-left">
              Description
            </label>

            <textarea
              value={value.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditDefaultGalleryPhotoDlg;