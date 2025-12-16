import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { TAgency } from "../../../models/Agency";
import { useNavigate } from "react-router-dom";

function List() {
  const navigate = useNavigate();
  const { agencyList } = useSelector((state: RootState) => state.agencyModule);
  const header = [
    { name: "ID", key: "id" },
    { name: "Name", key: "name" },
    { name: "Plan", key: "plan" },
  ]

  const openBusiness = (id: string | undefined) => {
    navigate(`/admin/list/${id}`)
  }

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {header.map((item) => (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {agencyList && agencyList.map((item: TAgency) => (
              <tr onClick={() => openBusiness(item.id)} key={item.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.id}</td>
                <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.name}</td>
                <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default List;
