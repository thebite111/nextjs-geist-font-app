import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export interface JWTPayload {
  userId: number
  email: string
  username: string
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export const getTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
