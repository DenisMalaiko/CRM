import { toast } from "react-toastify";
import { MiniTranslate } from "../enum/miniTranslate";
import { isDtoError, isConflictException } from "./handleError";

export const showError = (error: unknown) => {

  if (isDtoError(error)) {
    console.log("IS DTO ERROR")
    for(let message of error.data.message) {
      toast.error(message);
    }
    return;
  }

  if (isConflictException(error)) {
    toast.error(error.data.message);
    return;
  }

  if(error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error(MiniTranslate.UnhandledError);
}