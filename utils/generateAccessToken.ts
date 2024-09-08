import jwt from 'jsonwebtoken';

export function generateAccessToken(user: object): string {
  const secret = process.env.NODE_ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Environment variable NODE_ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(user, secret, { expiresIn: '60s' });
}
