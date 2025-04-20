import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, ISODateString } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { LOGIN_URL } from "@/lib/apiEndpoints";
import axios from "axios";
export type CustomSession = {
    user: CustomUser,
    expires: ISODateString
  };

export type CustomUser = {
    id?: string | null
    name?: string | null,
    email?: string | null,
    token?: string | null
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // Attach custom user fields from token to session
      if (token.user) {
        session.user = token.user as CustomUser;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: CustomUser }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        try {
          const { data } = await axios.post(LOGIN_URL, credentials);
          const user = data?.data;

          if (user) {
            return user;
          } else {
            return null;
          }
        } catch (error: any) {
          console.error("Login error:", error?.response?.data || error.message);
          throw new Error("Invalid credentials");
        }
      },
    }),
    // ...add more providers here
  ],
};
