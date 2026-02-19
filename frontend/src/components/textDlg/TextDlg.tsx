import React from 'react';
import { X } from "lucide-react";

function TextDlg({open, onClose, text }: { open: boolean, onClose: () => void, text: string}) {

  if (!open) return null;
  if (!text) return null;

  console.log("TEXT: ", text)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg
      rounded-2xl bg-white shadow-xl
      p-6 relative
      max-h-[90vh] overflow-auto">
        {/* Close */}
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
        >
          <X size={20} strokeWidth={2} color="white"></X>
        </button>

        {/* Text */}
        <div className="mt-8">
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