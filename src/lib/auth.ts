import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db'
import { getServerSession } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const staff = await prisma.staff.findUnique({
            where: { email: credentials.email },
            include: { restaurant: true },
          })

          if (!staff) {
            return null
          }

          const isPasswordValid = await compare(
            credentials.password,
            staff.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: staff.id,
            email: staff.email,
            name: staff.name,
            role: staff.role,
            restaurantId: staff.restaurantId,
          }
        } catch (error) {
          console.error('Auth error during credential validation:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.restaurantId = (user as any).restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).restaurantId = token.restaurantId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

/**
 * Server-side helper to get the current session.
 * Use this in API routes and server components.
 */
export async function getAuth() {
  return getServerSession(authOptions)
}

/**
 * Server-side helper that returns the session or throws 401.
 * Use in protected API route handlers.
 */
export async function requireAuth() {
  const session = await getAuth()
  if (!session?.user) {
    return null
  }
  return session
}

/**
 * Server-side helper that requires ADMIN role.
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (!session) return null
  if ((session.user as any).role !== 'ADMIN') return null
  return session
}

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    restaurantId: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      role: string
      restaurantId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    restaurantId: string
  }
}
