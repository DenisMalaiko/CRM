export type ApiResponse<T> = {
  statusCode?: number;
  message?: string | Array<string>;
  data: T | null;
  error?: any;
}