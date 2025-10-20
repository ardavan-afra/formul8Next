import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from './db'
import { User, UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        bio: true,
        skills: true,
        interests: true,
        gpa: true,
        year: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return user
  } catch (error) {
    return null
  }
}

export function requireAuth<TParams = any>(
  handler: (request: NextRequest, user: User, context?: { params: TParams }) => Promise<Response>
) {
  return async (request: NextRequest, context?: { params: TParams }) => {
    const user = await getCurrentUser(request)
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    return handler(request, user, context)
  }
}

export function requireRole<TParams = any>(roles: UserRole[]) {
  return (
    handler: (request: NextRequest, user: User, context?: { params: TParams }) => Promise<Response>
  ) => {
    return async (request: NextRequest, context?: { params: TParams }) => {
      const user = await getCurrentUser(request)
      if (!user) {
        return Response.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (!roles.includes(user.role)) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      return handler(request, user, context)
    }
  }
}

// Server-side auth function for server components
export async function getCurrentUserFromCookies(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        bio: true,
        skills: true,
        interests: true,
        gpa: true,
        year: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return user
  } catch (error) {
    return null
  }
}
