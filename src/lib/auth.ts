import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'bravo_secret_jwt_access_token_military_guard_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: TokenPayload, expiresIn: any = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function extractAuthUser(req: Request): TokenPayload | null {
  const authHeader = req.headers['authorization'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies['bravo_token']) {
    token = req.cookies['bravo_token'];
  }

  if (!token) return null;
  return verifyJwtToken(token);
}
