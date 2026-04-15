import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60
const ONE_DAY_IN_SECONDS = 24 * 60 * 60
const getDefaultTokenExpiry = () => Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000)

      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.iat = now
        token.exp = now + THIRTY_DAYS_IN_SECONDS
      } else if (typeof token.exp !== 'number') {
        token.exp = getDefaultTokenExpiry()
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ''
        session.user.isAdmin = token.isAdmin ?? false
      }
      const tokenExp = typeof token.exp === 'number' ? token.exp : getDefaultTokenExpiry()
      session.expires = new Date(tokenExp * 1000).toISOString()
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: THIRTY_DAYS_IN_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
  },
}
