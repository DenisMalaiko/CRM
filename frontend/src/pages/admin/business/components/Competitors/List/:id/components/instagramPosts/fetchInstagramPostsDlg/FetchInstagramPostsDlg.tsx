import React, { useMemo } from 'react';
import DatePicker from "react-datepicker";
import { useParams } from 'react-router-dom';
import { X } from "lucide-react";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../../../../../store/hooks";
import {
  useFetchInstagramPostsMutation,
  useGetInstagramPostsMutation
} from "../../../../../../../../../../store/competitor/competitorApi";
import { setInstagramPosts } from "../../../../../../../../../../store/competitor/competitorSlice";

// Models
import { ApiResponse } from "../../../../../../../../../../models/ApiResponse";
import { ChangeArg, isNativeEvent } from "../../../../../../../../../../utils/isNativeEvent";
import { TCompetitorPostParams } from "../../../../../../../../../../models/Competitor";

// Utils
import { showError } from "../../../../../../../../../../utils/showError";
import { isRequired } from "../../../../../../../../../../utils/validations";
import { toStartOfDay } from "../../../../../../../../../../utils/toDate";

function FetchInstagramPostsDlg({ open, onClose }: any) {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [ fetchInstagramPosts, { isLoading: isLoadingPosts } ] = useFetchInstagramPostsMutation();
  const [ getInstagramPosts ] = useGetInstagramPostsMutation();

  // Init Form
  const initForm = useMemo<TCompetitorPostParams>(() => {
    return {
      onlyPostsNewerThan: new Date(),
    }
  }, []);

  // Form Hooks
  const { form, handleChange } = useForm(initForm);

  // Validation Hooks
  const { validateField, validateAll } = useValidation({
    onlyPostsNewerThan: (value) => isRequired(value),
  });

  if(!open) return null;
  if(!id) return null;

  // Get Instagram Posts
  const getPostsData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const response: ApiResponse<any> = await fetchInstagramPosts({
        id,
        form: {
          onlyPostsNewerThan: toStartOfDay(form.onlyPostsNewerThan),
        },
      }).unwrap();

      if(response && response?.data) {
        const responsePosts: ApiResponse<any> = await getInstagramPosts(id).unwrap();
        if(responsePosts && responsePosts?.data) dispatch(setInstagramPosts(responsePosts.data));
        toast.success(response.message);
        onClose()
      }
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange({ name, value });
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Params</h2>
          <button
            onClick={onClose}
            className="text-white text-xl bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={getPostsData}>
          <div>
            <div className="flex items-center gap-2 justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 text-left">Only Posts Newer Than</label>
            </div>

            <div className="flex text-left">
              <DatePicker
                selected={form.onlyPostsNewerThan}
                onChange={(date: any) =>
                  onChange({
                    name: "onlyPostsNewerThan",
                    value: date,
                  })
                }
                className="w-full rounded-lg border px-3 py-2"
                dateFormat={"dd-MM-yyyy"}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingPosts}
              className="
                px-4 py-2 rounded-lg border  text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoadingPosts}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingPosts ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Getting...
                </>
              ) : ("Get")
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default FetchInstagramPostsDlg;
