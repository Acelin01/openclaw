import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { AuthService } from "@uxin/auth";
import { authConfig } from "./auth.config";
import { createGuestUser } from "@/lib/db/queries";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      accessToken?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    accessToken?: string;
    role?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  debug: true,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "uxin-dev-secret-key-12345678",
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
            console.log(`[NextAuth] 尝试登录: ${email}`);
            const result = await AuthService.login(email, password);
            console.log(`[NextAuth] API 响应:`, result);
            
            if (result.success && result.data) {
              return { 
                ...result.data.user, 
                accessToken: result.data.token, 
                type: "regular",
                role: result.data.user.role || 'CUSTOMER'
              };
            }
            
            console.error(`[NextAuth] 登录失败: ${result.message || result.error}`);
            return null;
          },
        }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        console.log(`[NextAuth] 尝试访客登录`);
        const result = await AuthService.guestLogin();
        console.log(`[NextAuth] 访客 API 响应:`, result);
        if (result.success && result.data) {
          return { 
            ...result.data.user, 
            accessToken: result.data.token, 
            type: "guest",
            role: 'CUSTOMER'
          };
        }
        console.error(`[NextAuth] 访客登录失败: ${result.message || result.error}`);
        return null;
      },
    }),
      ],
      callbacks: {
    jwt({ token, user }) {
      console.log(`[NextAuth] JWT Callback - User: ${!!user}`);
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.accessToken = user.accessToken;
        token.role = (user as any).role;
      }

      return token;
    },
    session({ session, token }) {
      console.log(`[NextAuth] Session Callback - Token: ${!!token}`);
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.accessToken = token.accessToken;
        (session.user as any).role = token.role;
      }

      return session;
    },
  },
});
