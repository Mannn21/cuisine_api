export interface MessageResponse<T> {
  timestamp: string;
  payload: {
    message: string;
    status: string;
    data: T;
  };
}
