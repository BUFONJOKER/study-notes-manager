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
          const loginResponse = await axios.post(
            `${baseUrl}/users/login`,
            formData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          );

          const accessToken: string = loginResponse.data.access_token;

          if (!accessToken) {
            return null;
          }

          // Fetch the authenticated user's profile.
          const profileResponse = await axios.get(`${baseUrl}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const profile = profileResponse.data;

          // Read the JWT expiry claim (exp) from the token payload.
          // This is for scheduling frontend logout; FastAPI remains
          // responsible for validating the token cryptographically.
          const parts = accessToken.split(".");

          if (parts.length !== 3) {
            throw new Error("Invalid access token format.");
          }

          const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString("utf8"),
          ) as { exp?: number };

          if (typeof payload.exp !== "number") {
            throw new Error("Access token has no expiry claim.");
          }

          return {
            id: String(profile.user_id),
            user_id: profile.user_id,
            user_name: profile.user_name,
            name: profile.user_name,
            accessToken,
            accessTokenExpires: payload.exp * 1000,
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
        token.accessTokenExpires = user.accessTokenExpires;
      }

      if (
        typeof token.accessTokenExpires !== "number" ||
        Date.now() >= token.accessTokenExpires
      ) {
        token.error = "AccessTokenExpired";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = String(token.user_id ?? "");
        session.user.name = String(token.user_name ?? "");
      }

      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : "";

      session.accessTokenExpires =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : 0;

      session.error =
        typeof token.error === "string" ? token.error : undefined;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    // FastAPI expiry is enforced separately.
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };