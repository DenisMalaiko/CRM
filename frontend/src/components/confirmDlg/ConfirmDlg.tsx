import React, { useState } from "react";
import { X } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  message?: string;
};

type ConfirmState = {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
};

let confirmInstance: (options: ConfirmOptions) => Promise<boolean>;

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    options: {},
  });

  confirmInstance = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ ...state, isOpen: false });
  };

  return (
    state.isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {state.options.title || "Confirm"}
            </h2>

            <button
              onClick={() => handleClose(false)}
              aria-label="Close"
              className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
            >
              <X size={18} strokeWidth={2} color="white" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-left">{state.options.message || "Are you sure?"}</p>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6">
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )
  );
}

// Глобальна функція confirm (Promise-based)
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return confirmInstance(options);
}