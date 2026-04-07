import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string;
      id_gd: number;
      gd_name?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: string;
    id_gd: number;
    gd_name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    id_gd: number;
    gd_name?: string | null;
  }
}
