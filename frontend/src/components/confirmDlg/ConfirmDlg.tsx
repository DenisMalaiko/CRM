import React, { useState } from "react";

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

/**
 * Викликати через:
 * const result = await confirm({ message: "Delete this product?" });
 */
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
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              {state.options.title || "Confirm"}
            </h2>
            <button
              onClick={() => handleClose(false)}
              className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <div>
            <p className="text-left">{state.options.message || "Are you sure?"}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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