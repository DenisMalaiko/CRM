import { ApiDtoError } from "../models/ApiDtoError";

export function isDtoError(error: unknown): error is ApiDtoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as any).hasOwnProperty('status') &&
    (error as any).status === 400 &&
    (error as any).hasOwnProperty('data') &&
    (error as any).data.error === 'Bad Request' &&
    (error as any).data.statusCode === 400 &&
    Array.isArray((error as any).data?.message)
  );
}