import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextRequest } from "next/server";

let cachedHandler: any = null;

const getHandler = async () => {
  if (cachedHandler) return cachedHandler;
  
  const { prisma } = await import("../../../../lib/prisma");
  
  cachedHandler = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      session: async ({ session, token }) => {
        if (session?.user) {
          session.user.id = token.sub!;
        }
        return session;
      },
    },
  });
  
  return cachedHandler;
};

export const GET = async (req: NextRequest, ctx: any) => {
  const handler = await getHandler();
  return handler(req, ctx);
};

export const POST = async (req: NextRequest, ctx: any) => {
  const handler = await getHandler();
  return handler(req, ctx);
};
