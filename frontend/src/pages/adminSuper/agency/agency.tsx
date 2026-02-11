import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../store/hooks";
import { useGetAgencyMutation, useGetUsersByAgencyIdMutation } from "../../../store/agency/agencyApi";
import { useGetBusinessesMutation } from "../../../store/businesses/businessesApi";
import { setAgency, setUsersByAgencyId } from "../../../store/agency/agencySlice";
import { setBusinesses } from "../../../store/businesses/businessesSlice";

// Utils
import { showError } from "../../../utils/showError";
import { getStatusClass } from "../../../utils/getStatusClass";
import { trimID } from "../../../utils/trimID";
import { toDate } from "../../../utils/toDate";

// Models
import { TUser } from "../../../models/User";


function Agency() {
  const dispatch = useAppDispatch();
  const [ getAgency ] = useGetAgencyMutation();
  const [ getBusinesses ] = useGetBusinessesMutation();
  const [ getUsersByBusinessId ] = useGetUsersByAgencyIdMutation();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { agency, usersByAgencyId } = useSelector((state: RootState) => state.agencyModule);
  const { businesses } = useSelector((state: RootState) => state.businessModule);

  const header = [
    { name: "ID", key: "id" },
    { name: "Name", key: "name" },
    { name: "Email", key: "email" },
    { name: "Role", key: "role" },
    { name: "Status", key: "status" },
  ];

  const headerBusinesses = [
    { name: "ID", key: "id" },
    { name: "Name", key: "name" },
    { name: "Industry", key: "industry" },
    { name: "Website", key: "website" },
    { name: "Status", key: "status" },
  ];

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response: any = await getAgency(id).unwrap();
          const responseUsers: any = await getUsersByBusinessId(id).unwrap();
          const responseBusinesses: any = await getBusinesses(id).unwrap();

          dispatch(setAgency(response.data));
          dispatch(setBusinesses(responseBusinesses.data));
          dispatch(setUsersByAgencyId(responseUsers.data));
        } catch (error) {
          console.error("Error fetching data:", error);
          showError(error);
        }
      }
    };

    fetchData();
  }, [id, dispatch]);

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-4">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <div className="flex w-full mb-4">
        <div className="w-full rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4">
            <h2 className="text-lg text-left font-semibold text-slate-800">Agency Details</h2>
          </div>

          <div className="space-y-3 text-slate-700 text-sm p-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">ID</span>
              <span className="text-slate-500">{trimID(agency?.id)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Name</span>
              <span className="text-slate-500">{agency?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Plan</span>
              <span className="text-slate-500">{agency?.plan}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Created At</span>
              <span className="text-slate-500">{ toDate(agency?.createdAt) }</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full mb-4">
        <div className="w-full rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4 mb-5">
            <h2 className="text-lg text-left font-semibold text-slate-800">Users</h2>
          </div>

          <div className="px-6 pb-6">
            <table className="min-w-full divide-y divide-slate-200 rounded-2xl shadow border overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  {header.map((item) => (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {usersByAgencyId && usersByAgencyId.map((item: TUser) => (
                  <tr key={item.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.id)}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.email}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.role}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${getStatusClass(item.status)}
                      `}>
                         {item?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex w-full mb-4">
        <div className="w-full rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4 mb-5">
            <h2 className="text-lg text-left font-semibold text-slate-800">Businesses</h2>
          </div>

          <div className="px-6 pb-6">
            <table className="min-w-full divide-y divide-slate-200 rounded-2xl shadow border overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  {headerBusinesses.map((item) => (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {businesses && businesses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.id)}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.industry}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.website}</td>
                    <td className="px-4 py-3 font-medium text-slate-600 text-left">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${getStatusClass(item.status)}
                      `}>
                         {item?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Agency;
