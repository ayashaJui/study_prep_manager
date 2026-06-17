import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth";
import {
  DefaultSession,
  type Account,
  type Session,
  type User as NextAuthUser,
} from "next-auth";
import type { JWT } from "next-auth/jwt";

// Extend the built-in session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await comparePassword(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: NextAuthUser;
      account: Account | null;
    }) {
      if (account?.provider === "github" || account?.provider === "google") {
        await connectDB();

        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          // Create new user for OAuth
          dbUser = new User({
            email: user.email,
            name: user.name || (user.email ? user.email.split("@")[0] : "User"),
            avatar: user.image,
            provider: account.provider,
            [`${account.provider}Id`]: account.providerAccountId,
          });
          await dbUser.save();
        } else if (!dbUser[`${account.provider}Id`]) {
          // Link OAuth to existing user account
          dbUser[`${account.provider}Id`] = account.providerAccountId;
          dbUser.provider = account.provider;
          await dbUser.save();
        }

        user.id = dbUser._id.toString();
        user.image = dbUser.avatar;
      }

      return true;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: NextAuthUser;
      account?: Account | null;
    }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider || "credentials";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
