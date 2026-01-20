import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";

const roleMap: Record<string, Role> = {
  Administrator: "ADMIN",
  Poveljnik: "POVELJNIK",
  Gasilec: "CLAN",
  Uporabnik: "UPORABNIK",
};

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Geslo", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";

        if (!email || !password) return null;

        const user = await prisma.uporabnik.findUnique({
          where: { email },
          include: { vloga_v_aplikaciji: true },
        });

        if (!user?.geslo) return null;

        const ok = await bcrypt.compare(password, user.geslo);
        if (!ok) return null;

        const dbRoleName = user.vloga_v_aplikaciji?.ime ?? "Uporabnik";
        const role: Role = roleMap[dbRoleName] ?? "UPORABNIK";

        return {
          id: String(user.id_u),
          name: user.ime,
          email: user.email,
          role,
          id_gd: user.id_gd,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.id_gd = (user as any).id_gd;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as any;
        (session.user as any).role = token.role as any;
        (session.user as any).id_gd = token.id_gd as any;
      }
      return session;
    },
  },
};
