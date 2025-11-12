import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../store/hooks";

import { TClient } from "../../../models/Client";
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import { toDate } from "../../../utils/toDate";
import { toast } from "react-toastify";
import CreateClientsDlg from "./createClientsDlg/CreateClientsDlg";

import { useGetClientsMutation } from "../../../store/clients/clientsApi";
import { useDeleteClientMutation } from "../../../store/clients/clientsApi";
import { setClients } from "../../../store/clients/clientsSlice";

function Clients() {
  const dispatch = useAppDispatch();

  const [ getClients ] = useGetClientsMutation();
  const [ deleteClient ] = useDeleteClientMutation();

  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TClient | null>(null);
  const { clients } = useSelector((state: RootState) => state.clientsModule)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getClients();
        dispatch(setClients(response.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);

  const header = [
    { name: "Image", key: "image" },
    { name: "First Name", key: "firstName" },
    { name: "Last Name", key: "lastName" },
    { name: "Email", key: "email" },
    { name: "Phone", key: "phoneNumber" },
    { name: "Role", key: "role" },
    { name: "Address", key: "address" },
    { name: "Created At", key: "createdAt" },
    { name: "Updated At", key: "updatedAt" },
    { name: "Actions", key: "actions" }
  ];

  const openConfirmDlg = async (e: any, item: TClient) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Client",
      message: "Are you sure you want to delete this client?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteClient(item.id).unwrap();
          const response: any = await getClients();
          dispatch(setClients(response.data.data));
          toast.success(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }

  const openEditClient = async (item: TClient) => {
    setSelectedClient(item);
    setOpen(true)
  }

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Clients</h1>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Client
          </button>

          <CreateClientsDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedClient(null);
            }}
            client={selectedClient}
          ></CreateClientsDlg>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {header.map((item) => (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {clients && clients.map((item: TClient) => (
              <tr key={item.id} className="hover:bg-slate-50 bg-slate-50">
                <td className="px-4 py-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.firstName}</td>
                <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.lastName}</td>
                <td className="px-4 py-3 text-left">{item.email}</td>
                <td className="px-4 py-3 text-left">{item.countryCode}{item.phoneNumber}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{item.role}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{item.address}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{toDate(item.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{toDate(item.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEditClient(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                      ✎
                    </button>
                    <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Clients;
