import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import CreatePromptDlg from "./createPromptDlg/CreatePromptDlg";
import { useAppDispatch } from "../../../../../store/hooks";
import { showError } from "../../../../../utils/showError";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import { ApiResponse } from "../../../../../models/ApiResponse";

import { TPrompt } from "../../../../../models/Prompt";

function Prompts() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [open, setOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<TPrompt | null>(null);

  if(!businessId) return null;

  const header = [
    { name: "Name", key: "name" },
    { name: "Purpose", key: "purpose" },
    { name: "Text", key: "text" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ];

  return (
    <section>
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Prompts</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Prompt
          </button>

          <CreatePromptDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedPrompt(null);
            }}
            profile={selectedPrompt}
          ></CreatePromptDlg>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {header.map((item, index) => (
                  <th
                    key={item.key}
                    className={`
                        px-4 py-3 text-xs font-semibold uppercase tracking-wide
                        ${item.key === "actions" ? "text-right" : "text-left"}
                        text-slate-600
                      `}
                  >{ item.name }</th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Prompts;