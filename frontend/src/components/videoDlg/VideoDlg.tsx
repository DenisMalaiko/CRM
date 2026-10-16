import React from 'react';
import { X } from "lucide-react";

function VideoDlg({open, onClose, videoUrl }: { open: boolean, onClose: () => void, videoUrl: string}) {

  if (!open) return null;
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Video</h2>
          <button
            onClick={() => onClose()}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        {/* Video */}
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

export default VideoDlg;