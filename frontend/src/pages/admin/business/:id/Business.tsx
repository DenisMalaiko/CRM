import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react"
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../store/hooks";
import { useGetBusinessMutation } from "../../../../store/businesses/businessesApi";
import { setBusiness } from "../../../../store/businesses/businessesSlice";
import { ApiResponse } from "../../../../models/ApiResponse";
import { TBusiness } from "../../../../models/Business";
import { showError } from "../../../../utils/showError";
import { SidebarNav } from "./SidebarNav";

function Business() {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const dispatch = useAppDispatch();
  const [getBusiness] = useGetBusinessMutation();
  const [isBusinessReady, setIsBusinessReady] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    setIsBusinessReady(false);
    getBusiness(businessId).unwrap().then((response: ApiResponse<TBusiness>) => {
      if (cancelled) return;
      if (response?.data) dispatch(setBusiness(response.data));
      setIsBusinessReady(true);
    }).catch((error: unknown) => {
      if (cancelled) return;
      showError(error);
      setIsBusinessReady(true);
    });
    return () => { cancelled = true; };
  }, [businessId, dispatch, getBusiness]);

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-4">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate("/profile/businesses")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <section className="w-full">
        <div className="container mx-auto grid grid-cols-12 gap-6 mb-5">
          <aside className="col-span-2">
            <SidebarNav />
          </aside>

          <main className="col-span-10">
            {isBusinessReady ? <Outlet /> : (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            )}
          </main>
        </div>
      </section>
    </section>
  )
}
export default Business;
