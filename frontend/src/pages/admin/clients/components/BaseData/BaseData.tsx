import React, {useEffect, useState} from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { setClient } from "../../../../../store/clients/clientsSlice";

import { useGetClientsMutation } from "../../../../../store/clients/clientsApi";
import { TClient } from "../../../../../models/Client";
import {trimID} from "../../../../../utils/trimID";
import {toDate} from "../../../../../utils/toDate";

import CreateClientsDlg from "../../createClientsDlg/CreateClientsDlg";

function BaseData() {
  const dispatch = useAppDispatch();

  const [ getClient ] = useGetClientsMutation();

  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TClient | null>(null);

  const { client } = useSelector((state: RootState) => state.clientsModule)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getClient().unwrap();
        dispatch(setClient(response.data[0]));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);


  const openEditClient = async (item: TClient) => {
    setSelectedClient(item);
    setOpen(true)
  }


  return (
    <section>
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Client Details</h2>

        <button
          onClick={() => openEditClient(client as TClient)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Edit Client
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

      <div className="space-y-3 text-slate-700 text-sm p-6">
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">ID</span>
          <span className="text-slate-500">{trimID(client?.id)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Agency ID</span>
          <span className="text-slate-500">{trimID(client?.agencyId)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">First Name</span>
          <span className="text-slate-500">{client?.firstName}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Last Name</span>
          <span className="text-slate-500">{client?.lastName}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Email</span>
          <span className="text-slate-500">{client?.email}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Phone</span>
          <span className="text-slate-500">{client?.countryCode} {client?.phoneNumber}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Address</span>
          <span className="text-slate-500">{client?.address}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Role</span>
          <span className="text-slate-500">{client?.role}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Status</span>
          <span className="text-slate-500">{client?.isActive}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Created At</span>
          <span className="text-slate-500">{toDate(client?.createdAt)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Updated At</span>
          <span className="text-slate-500">{toDate(client?.updatedAt)}</span>
        </div>
      </div>
    </section>
  )
}

export default BaseData;