import { toast } from "react-toastify";
import { MiniTranslate } from "../enum/miniTranslate";

export const validateForm = (errors: object): boolean => {
  const isValid = Object.values(errors).every((v) => !v);

  if (!isValid) {
    toast.error(MiniTranslate.InvalidData);
  }

  return isValid;
};