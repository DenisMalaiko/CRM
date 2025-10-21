import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import CreateClientsDlg from "./createClientsDlg/CreateClientsDlg";
import { getClients } from "../../../store/clients/clientsThunks";
import { TClient } from "../../../models/Client";

function Clients() {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TClient | null>(null);
  const { clients } = useSelector((state: RootState) => state.clientsModule)

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  const header = [
    { name: "Image", key: "image" },
    { name: "First Name", key: "firstName" },
    { name: "Last Name", key: "lastName" },
    { name: "Email", key: "email" },
    { name: "Phone", key: "phoneNumber" },
    { name: "Address", key: "address" },
    { name: "Active", key: "isActive" },
    { name: "Updated", key: "updatedAt" },
    { name: "Actions", key: "actions" }
  ];

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-end px-4 py-3">
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
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.firstName}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{item.lastName}</td>
                <td className="px-4 py-3 font-medium text-left">{item.email}</td>
                <td className="px-4 py-3 text-left">{item.phoneNumber}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{item.address}</td>
                <td className="px-4 py-3 text-slate-600 text-left">{item.role}</td>
                <td className="px-4 py-3 text-left">
                  <span className={`inline-flex items-start px-2 py-1 text-xs font-medium rounded-full`}>{item.role}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                      ✎
                    </button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
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