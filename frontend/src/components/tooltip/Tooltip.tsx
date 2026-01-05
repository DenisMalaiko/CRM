import React from "react";

function Tooltip({ text }: any) {
  return (
    <div className="relative inline-block group">
      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-slate-600 rounded-full cursor-pointer">
        ?
      </span>

      <div
        className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          w-64
          rounded-md bg-slate-900 px-3 py-2
          text-xs text-white
          opacity-0 scale-95
          transition-all duration-200
          group-hover:opacity-100 group-hover:scale-100
          pointer-events-none
          z-50
        "
      >
        {text}
      </div>
    </div>
  )
}

export default Tooltip;