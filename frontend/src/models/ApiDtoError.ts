export type ApiDtoError = {
  status: number;
  data: {
    statusCode: number;
    message: string[];
    error: string;
  };
};