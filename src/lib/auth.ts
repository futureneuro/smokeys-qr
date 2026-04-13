import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db'

export const authOptions = {
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
            where: { email: credentials.email as string },
            include: { restaurant: true },
          })

          if (!staff) {
            return null
          }

          const isPasswordValid = await compare(
            credentials.password as string,
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
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

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
