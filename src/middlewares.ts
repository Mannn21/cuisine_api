import { NextFunction, Request, Response } from 'express';
import { HttpStatus, StatusText } from '../lib/statusEnum';
import jwt from 'jsonwebtoken';
import response from "../utils/response"

export function notFound(req: Request, res: Response, next: NextFunction) {
  response(
    HttpStatus.NOT_FOUND,
    StatusText.NOT_FOUND,
    null,
    `🔍 - Not Found - ${req.originalUrl}`,
    res,
  );
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
  response(
    statusCode,
    StatusText.ERROR,
    null,
    err.message,
    res
  );
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers['authorization'];
  const token = authToken && authToken.split(' ')[1];

  if (!token) return response(HttpStatus.UNAUTHORIZED, StatusText.UNAUTHORIZED, null, "Invalid token", res);

  const secret = process.env.NODE_ACCESS_TOKEN_SECRET;
  if (!secret) {
    return response(HttpStatus.INTERNAL_SERVER_ERROR, StatusText.ERROR, null, "Server error: missing token secret", res);
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, "Forbidden", res);
    if (decoded && typeof decoded !== 'string' && 'email' in decoded) {
      req.email = decoded.email;
      next();
    } else {
      return response(HttpStatus.FORBIDDEN, StatusText.FORBIDDEN, null, "Invalid token payload", res);
    }
  });
}
