import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        try {
          const params = new URLSearchParams();
          params.append("username", credentials.username);
          params.append("password", credentials.password);

          const response = await axios.post<LoginResponse>(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/login`,
            params,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );

          const data = response.data;
          if (data && data.access_token) {
            return {
              id: credentials.username,
              name: credentials.username,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (error: unknown) {
          if (axios.isAxiosError<{ detail?: string }>(error)) {
            throw new Error(error.response?.data?.detail || "Authentication failed");
          }
          throw new Error("Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };