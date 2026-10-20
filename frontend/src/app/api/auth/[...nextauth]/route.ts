
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "FastApi Login",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

        if (!baseUrl) {
          throw new Error("API URL is not configured.");
        }

        const formData = new URLSearchParams();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);

        try {
          // 1. Authenticate with FastAPI.
          const loginResponse = await axios.post(
            `${baseUrl}/users/login`,
            formData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const accessToken: string = loginResponse.data.access_token;

          if (!accessToken) {
            return null;
          }

          // 2. Fetch the actual authenticated user's profile.
          const profileResponse = await axios.get(
            `${baseUrl}/users/me`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const profile = profileResponse.data;

          // 3. Return real user information to NextAuth.
          return {
            id: String(profile.user_id),
            user_id: profile.user_id,
            user_name: profile.user_name,
            name: profile.user_name,
            accessToken,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 400 ||
              error.response?.status === 422
            ) {
              return null;
            }
          }

          console.error(
            "Authentication error:",
            axios.isAxiosError(error)
              ? error.message
              : "Unexpected authentication error"
          );

          throw new Error("Failed to authenticate with the server.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id;
        token.user_name = user.user_name;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.user_id ?? "");
        session.user.name = String(token.user_name ?? "");
      }

      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
