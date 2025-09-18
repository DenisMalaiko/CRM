import { ApiResponse } from "../models/ApiResponse";
import { MiniTranslate } from "../enum/miniTranslate";

export function buildError(
  message?: string | null,
  statusCode = 500,
  error: any = null
): ApiResponse<null> {
  return {
    statusCode,
    message: message ?? MiniTranslate.UnhandledError,
    error,
    data: null,
  };
}