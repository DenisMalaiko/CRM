import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RefreshCcw } from "lucide-react";
import Select from "react-select";

import CreateCreativeDlg from "./createCreativeDlg/CreateCreativeDlg";
import { useAppDispatch } from "../../../../../store/hooks";
import { showError } from "../../../../../utils/showError";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../models/AIArtifact";
import { getStatusClass } from "../../../../../utils/getStatusClass";

import { useGetCreativesMutation, useUpdateCreativeMutation, useDeleteCreativeMutation } from "../../../../../store/artifact/artifactApi";
import { useGetProfilesMutation } from "../../../../../store/profile/profileApi";
import { useGetProductsMutation} from "../../../../../store/products/productsApi";

import { setCreatives } from "../../../../../store/artifact/artifactSlice";
import { setProfiles } from "../../../../../store/profile/profileSlice";
import { setProducts } from "../../../../../store/products/productsSlice";
import { TBusinessProfile } from "../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../models/Product";

function Creatives() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getCreatives ] = useGetCreativesMutation();
  const [ updateCreative ] = useUpdateCreativeMutation();
  const [ deleteCreative ] = useDeleteCreativeMutation();
  const [ getProfiles ] = useGetProfilesMutation();
  const [ getProducts ] = useGetProductsMutation();

  const [open, setOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profilesIds, setProfilesIds] = useState<string[]>([]);
  const [productsIds, setProductsIds] = useState<string[]>([]);

  const filteredCreatives = useSelector(((state: any) => {
    const { creatives } = state.artifactModule;

    return creatives?.filter((creative: TAIArtifact) => {
      const profileMatch =
        profilesIds.length === 0 ||
        profilesIds.includes(creative.businessProfileId);

      const productMatch =
        productsIds.length === 0 ||
        (Array.isArray(creative.products) && creative.products.some((p: any) => productsIds.includes(p.productId)));

      return profileMatch && productMatch;
    });
  }));
  const { profiles } = useSelector((state: any) => state.profileModule);
  const { products } = useSelector((state: any) => state.productsModule);

  const profilesOptions = profiles?.map((profile: any) => ({ value: profile.id, label: profile.name })) || [];
  const productsOptions = products?.map((product: any) => ({ value: product.id, label: product.name })) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TAIArtifact[]> = await getCreatives(businessId).unwrap();
          const profilesResponse: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

          console.log("RESPONSE ", response);
          console.log("PROFILES RESPONSE ", profilesResponse);

          if(response && response?.data) dispatch(setCreatives(response.data));
          if(profilesResponse && profilesResponse?.data) dispatch(setProfiles(profilesResponse.data));
          if(productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  const openConfirmDlg = async (e: any, item: TAIArtifact) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Artifact",
      message: "Are you sure you want to delete this artifact?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteCreative(item.id);
          const response: any = await getCreatives(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setCreatives(response.data));
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  const openEditCreative = async (item: TAIArtifact) => {
    setSelectedCreative(item);
    setOpen(true)
  }

  const deleteCreatives = async () => {
    const ok = await confirm({
      title: "Delete Artifacts",
      message: "Are you sure you want to delete this artifact?",
    });

    if(ok) {
      try {
        if (selectedIds?.length > 0) {
          await Promise.all(
            selectedIds.map(async (id) => {
              await deleteCreative(id);
            })
          )
          const response: any = await getCreatives(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setCreatives(response.data));
            setSelectedIds([]);
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }


  return (
    <section>
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Creatives</h2>

          <div className="flex items-center gap-3">
            { profiles && profiles.length > 0 &&
              <Select
                isMulti
                placeholder="Select profiles"
                options={profilesOptions}
                value={profilesOptions.filter((option: { value: string; label: string; }) =>
                  profilesIds.includes(option.value)
                )}
                onChange={(selected) => {
                  setProfilesIds(selected.map(option => option.value));
                }}
              />
            }

            { products && products.length > 0 &&
              <Select
                isMulti
                placeholder="Select products"
                options={productsOptions}
                value={productsOptions.filter((option: { value: string; label: string; }) =>
                  productsIds.includes(option.value)
                )}
                onChange={(selected) => {
                  setProductsIds(selected.map(option => option.value));
                }}
              />
            }

            { selectedIds.length > 0 &&
              <button
                onClick={() => deleteCreatives()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                  Delete Creatives
              </button>
            }
          </div>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="grid grid-cols-2 gap-6">
          {filteredCreatives?.map((item: TAIArtifact) => (
            <div
              key={item.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => setSelectedIds(selectedIds.includes(item.id) ? selectedIds.filter(id => id !== item.id) : [...selectedIds, item.id])}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {item.type}
                  </span>

                  <span className={`
                    inline-flex items-center rounded-full px-2.5 py-1
                    text-xs font-medium
                    ${getStatusClass(item.status)}
                  `}>
                     {item?.status}
                  </span>
                </div>

                {/*<button
                  onClick={() => onEdit(item.id)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium
                   text-slate-600 hover:bg-slate-100 hover:text-slate-900
                   transition"
                >
                  ✏️ Edit
                </button>*/}

                <div className="flex items-center gap-3">
                  <button onClick={() => openEditCreative(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                    ✎
                  </button>
                  <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                    🗑
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4 px-6 py-5">
                {/* Hook */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                    Hook
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 text-left">
                    {item.outputJson?.hook || "—"}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                    Description
                  </p>
                  <p className="mt-1 text-slate-700 leading-relaxed text-left">
                    {item.outputJson?.body || "—"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto border-t border-slate-100 bg-slate-50 px-6 py-4">
                {/* CTA */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                    CTA
                  </p>
                  <p className="mt-1 font-medium text-indigo-600 text-left">
                    {item.outputJson?.cta || "—"}
                  </p>
                </div>

                {/* Products (debug / optional) */}
                {item.products && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                      Products context
                    </summary>
                    <pre className="mt-2 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                      {JSON.stringify(item.products, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateCreativeDlg
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedCreative(null);
        }}
        creative={selectedCreative}
      ></CreateCreativeDlg>
    </section>
  )
}

export default Creatives;