import { toast } from "react-toastify";
import { MiniTranslate } from "../enum/MiniTranslate";
import { isDtoError, isConflictException, isAuthError } from "./handleError";

export const showError = (error: unknown) => {

  if (isDtoError(error)) {
    for(let message of error.data.message) {
      toast.error(message);
    }
    return;
  }

  if (isConflictException(error)) {
    toast.error(error.data.message);
    return;
  }

  if(isAuthError(error)) {
    toast.error(error.data.message);
    return;
  }

  if(error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error(MiniTranslate.UnhandledError);
}