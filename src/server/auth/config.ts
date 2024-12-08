import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Adapter } from "next-auth/adapters"
import { db } from "~/server/db";


/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login ?? "Uknown",
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    session: ({ session, user}) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        username: user.username
      },
    })
  },
} satisfies NextAuthConfig;
