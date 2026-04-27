import React, { useState } from 'react';
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
}

function EditPhotoDlg({open, onClose}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const editPhoto = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("EDIT PHOTO")
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("DATA: ", data)
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter prompt..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              { isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Creating...
                </>
              ) : ("Create")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPhotoDlg;