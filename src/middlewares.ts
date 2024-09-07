import { NextFunction, Request, Response } from 'express';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import response from "../utils/response"

export function notFound(req: Request, res: Response, next: NextFunction) {
  response(
    HttpStatus.NOT_FOUND,
    StatusText.NOT_FOUND,
    null,
    `🔍 - Not Found - ${req.originalUrl}`,
    res,
    // requestId
  );
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
  response(
    
    statusCode,
    StatusText.ERROR,
    null,
    err.message,
    res,
    // requestId
  );
}