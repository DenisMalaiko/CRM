import { toast } from "react-toastify";
import { MiniTranslate } from "../enum/miniTranslate";
import { isDtoError } from "./isDtoError";

export const showError = (error: unknown) => {

  if (isDtoError(error)) {
    for(let message of error.data.message) {
      toast.error(message);
    }
    return;
  }

  if(error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error(MiniTranslate.UnhandledError);
}