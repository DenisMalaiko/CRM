import React from 'react';
import { X } from "lucide-react";

function TextDlg({open, onClose, text }: { open: boolean, onClose: () => void, text: string}) {

  if (!open) return null;
  if (!text) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-auto">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Details</h2>
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
          { Array.isArray(text) ? (
            text.map((item, index) => {
              return (
                <p key={index} className="text-left whitespace-pre-wrap mb-4">
                  {item}
                </p>
              );
            })
          ) : (
            <p className="text-left whitespace-pre-wrap">{text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TextDlg;