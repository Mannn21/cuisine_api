import { Response } from "express";
import { MessageResponse } from "../src/interfaces/MessageResponse";
import { HttpStatus, StatusText } from "../lib/statusEnum";

const response = <T>(
  statusCode: HttpStatus,
  status: StatusText,
  data: T,
  message: string,
  res: Response,
): Response<MessageResponse<T>> => {
  const responseBody: MessageResponse<T> = {
    timestamp: new Date().toISOString(),
    payload: {
      message,
      status,
      data,
    },
  };

  return res.status(statusCode).json(responseBody);
};

export default response;
