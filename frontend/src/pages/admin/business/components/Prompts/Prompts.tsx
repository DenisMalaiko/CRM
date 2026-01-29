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

import { useGetPromptsMutation, useDeletePromptMutation } from "../../../../../store/prompts/promptApi";

import { setPrompts } from "../../../../../store/prompts/promptSlice";

function Prompts() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getPrompts ] = useGetPromptsMutation();
  const [ deletePrompt ] = useDeletePromptMutation();

  const { prompts } = useSelector((state: any) => state.promptModule);

  const [open, setOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<TPrompt | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  const header = [
    { name: "Name", key: "name" },
    { name: "Purpose", key: "purpose" },
    { name: "Text", key: "text" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ];

  const openConfirmDlg = async (e: any, item: TPrompt) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Prompt",
      message: "Are you sure you want to delete this prompt?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deletePrompt(item.id);
          const response: ApiResponse<TPrompt[]> = await getPrompts(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setPrompts(response.data));
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  const openEditPrompt = async (item: TPrompt) => {
    setSelectedPrompt(item);
    setOpen(true)
  }

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
            prompt={selectedPrompt}
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

            <tbody className="divide-y divide-slate-100">
              {prompts?.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    className="py-6 text-center text-slate-400"
                  >
                    No data
                  </td>
                </tr>
              ) : (
                prompts.map((item: TPrompt) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.purpose}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.text}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-1
                      text-xs font-medium
                      ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                    `}>
                      {item.isActive ? "Yes" : "No"}
                    </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEditPrompt(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                          ✎
                        </button>
                        <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Prompts;