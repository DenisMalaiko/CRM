import React, { useEffect, useState } from "react";
import { Chat } from "./chat/Chat";
import { Eye, Delete } from "lucide-react";
import { useAppDispatch } from "../../../../store/hooks";

import { useGetSessionsMutation, useDeleteSessionMutation } from "../../../../store/ai/manager/managerApi";
import {toDate} from "../../../../utils/toDate";
import {trimID} from "../../../../utils/trimID";
import {TProduct} from "../../../../models/Product";
import {confirm} from "../../../../components/confirmDlg/ConfirmDlg";
import { setSessions } from "../../../../store/ai/manager/managerSlice";
import {toast} from "react-toastify";
import {useSelector} from "react-redux";
import {RootState} from "../../../../store";

function Manager() {
  const dispatch = useAppDispatch();

  const [ getSessions ] = useGetSessionsMutation();
  const [ deleteSession ] = useDeleteSessionMutation();

  const { sessions } = useSelector((state: RootState) => state.managerModule);

  const header = [
    { name: "Session Id", key: "id" },
    { name: "User Id", key: "userId" },
    { name: "User Name", key: "userName"},
    { name: "User Email", key: "userEmail"},
    { name: "Messages", key: "messages"},
    { name: "Created At", key: "createdAt" },
    { name: "Actions", key: "actions"}
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("FETCHING DATA...");
        const response = await getSessions().unwrap();
        console.log("RESPONSE: ", response.data);
        dispatch(setSessions(response.data.data));
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);


  const openConfirmDlg = async (e: any, item: TProduct) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this session?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          console.log("ITEM ID: ", item.id);
          await deleteSession(item.id);
          const response: any = await getSessions().unwrap();

          console.log("AFTER DELETE: ", response.data);
          dispatch(setSessions(response.data.data));
          toast.success(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }


  return (
    <section className="relative h-full">
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Manager</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            + Add New
          </button>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {header.map((item, index) => (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600c" key={item.key}>{ item.name }</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            { sessions && sessions.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.id)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.userId)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.user.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.user.email}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.messages.length}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item?.createdAt)}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </div>

      <Chat />
    </section>
  )
}

export default Manager;