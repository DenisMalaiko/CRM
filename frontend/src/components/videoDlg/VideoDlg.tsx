import React from 'react';
import { X } from "lucide-react";

function VideoDlg({open, onClose, videoUrl }: { open: boolean, onClose: () => void, videoUrl: string}) {

  if (!open) return null;
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg relative ">

        {/* Close */}
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
        >
          <X size={20} strokeWidth={2} color="white"></X>
        </button>

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