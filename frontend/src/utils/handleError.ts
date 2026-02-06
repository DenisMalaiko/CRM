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

export function isConflictException(error: unknown): error is ApiDtoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as any).hasOwnProperty('status') &&
    (error as any).status === 409 &&
    (error as any).hasOwnProperty('data') &&
    (error as any).data.error === 'Conflict' &&
    (error as any).data.statusCode === 409 &&
    typeof (error as any).data?.message === 'string'
  );
}

export function isAuthError(error: unknown): error is ApiDtoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as any).hasOwnProperty('status') &&
    (error as any).status === 401 &&
    (error as any).hasOwnProperty('data') &&
    (error as any).data.error === 'Unauthorized' &&
    (error as any).data.statusCode === 401 &&
    typeof (error as any).data?.message === 'string'
  );
}

export function isNotFound(error: unknown): error is ApiDtoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as any).hasOwnProperty('status') &&
    (error as any).status === 404 &&
    (error as any).hasOwnProperty('data') &&
    (error as any).data.error === 'Not Found' &&
    (error as any).data.statusCode === 404 &&
    typeof (error as any).data?.message === 'string'
  )
}