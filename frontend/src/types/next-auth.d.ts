
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    accessTokenExpires: number;
    error?: string;
  }

  interface User {
    user_id: number;
    user_name: string;
    accessToken: string;
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: number;
    user_name?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
