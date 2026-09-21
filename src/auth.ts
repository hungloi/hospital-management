import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Số điện thoại hoặc email", type: "text", placeholder: "0905123456 hoặc email@domain.com" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
        
        const lookupValue = credentials.email as string;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: lookupValue },
              { phone: lookupValue }
            ]
          }
        });
        
        if (!user) {
          console.log('User not found in DB:', lookupValue);
          return null;
        }
        
        const isPasswordValid = credentials.password === user.password || 
                               await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          console.log('Password mismatch for user:', credentials.email);
          return null;
        }

        console.log('Login successful for user:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: '/login',
  }
});
