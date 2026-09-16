import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ExternalLink } from "lucide-react";

// Redux
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../store/hooks";
import { useSelector } from "react-redux";
import { useGetBusinessesMutation } from "../../../store/businesses/businessesApi";
import { useDeleteBusinessMutation } from "../../../store/businesses/businessesApi";
import { setBusinesses } from "../../../store/businesses/businessesSlice";

// Components
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import CreateBusinessDlg from "./createBusinessDlg/CreateBusinessDlg";

// Utils
import { showError } from "../../../utils/showError";
import { getStatusClass } from "../../../utils/getStatusClass";

// Models
import { ApiResponse } from "../../../models/ApiResponse";
import { TBusiness } from "../../../models/Business";

function Businesses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [ getBusinesses ] = useGetBusinessesMutation();
  const [ deleteBusiness ] = useDeleteBusinessMutation();

  const [ open, setOpen ] = useState(false);
  const [ selectedBusiness, setSelectedBusiness ] = useState<TBusiness | null>(null);
  const { businesses } = useSelector((state: RootState) => state.businessModule);

  const header = [
    { name: t('General.name'), key: "name" },
    { name: t('General.website'), key: "website" },
    { name: t('General.facebook'), key: "facebookLink" },
    { name: t('General.instagram'), key: "instagramLink" },
    { name: t('Businesses.industry'), key: "industry" },
    { name: t('General.status'), key: "status" },
    { name: t('General.actions'), key: "actions" }
  ];

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getBusinesses().unwrap();
        if(response && response.data) dispatch(setBusinesses(response.data));
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  // Delete Business
  const openConfirmDlg = async (e: any, item: TBusiness) => {
    e.preventDefault();

    const ok = await confirm({
      title: t('Businesses.deleteBusiness'),
      message: t('Businesses.deleteConfirmMessage'),
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseBusiness = await deleteBusiness(item.id).unwrap();
          if(responseBusiness && responseBusiness.data) toast.success(responseBusiness.message);

          const response: ApiResponse<TBusiness[]> = await getBusinesses().unwrap();
          if(response && response.data) dispatch(setBusinesses(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }
  }

  // Open Edit Business Dialog
  const openEditBusiness = async (item: TBusiness) => {
    setSelectedBusiness(item);
    setOpen(true)
  }

  // Open Business Page
  const openBusiness = (id?: string) => {
    navigate(`${id}/dashboard`);
  }

  return (
    <section>
      <div>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">{t('Businesses.title')}</h1>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            {t('Businesses.addBusiness')}
          </button>

          <CreateBusinessDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedBusiness(null);
            }}
            business={selectedBusiness}
          ></CreateBusinessDlg>
        </div>

        <div className="w-full mx-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
              <tr>
                {header.map((item) => (
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
              {businesses && businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    className="py-6 text-center text-slate-400"
                  >
                    {t('General.noData')}
                  </td>
                </tr>
              ) : (
                businesses && businesses.map((item: TBusiness) => (
                  <tr key={item.id} onClick={() => openBusiness(item?.id)} className="bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      {item.website ? (
                        <a href={item.website} onClick={(e) => e.stopPropagation()} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                          {t('General.website')}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      {item.facebookLink ? (
                        <a href={item.facebookLink} onClick={(e) => e.stopPropagation()} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                          {t('General.facebook')}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      {item.instagramLink ? (
                        <a href={item.instagramLink} onClick={(e) => e.stopPropagation()} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                          {t('General.instagram')}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.industry}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${getStatusClass(item.status)}
                      `}>
                         {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditBusiness(item)
                          }} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                          ✎
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation()
                          openConfirmDlg(e, item)
                        }} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
      </div>
    </section>
  )
}

export default Businesses;
