import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";

export const options = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        if (user.email !== (process.env.VALID_EMAIL as string)) {
          return null;
        }
      }
      return token;
    },
  },
};
