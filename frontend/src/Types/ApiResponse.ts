export type ApiResponse<T> = {
  code: number;
  message: string;
  timeStamp: string;
  result: T;
};
