import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "FastApi Login",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Enter your username" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                // 1. Convert to url-encoded payload for FastAPI OAuth2 specification
                const formData = new URLSearchParams();
                formData.append("username", credentials.username);
                formData.append("password", credentials.password);

                try {
                    // 2. Send a POST request to the FastAPI login endpoint
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, formData, {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },

                    });



                    // 3. Axios maps JSON automatically under response.data
                    if (response.status === 200 && response.data.access_token) {
                        return {
                            id: credentials.username,
                            name: credentials.username,
                            accessToken: response.data.access_token, // injecting fastapi bearer token into the user object
                        };
                    }
                    return null; // Return null if the credentials are invalid
                } catch (error: any) {
                    console.error("Authentication error:", error);

                    // 3. Forward the thrown error, or catch network connection issues
                    throw new Error(error.message || "Failed to connect to authentication server.");
                }
            },
        }),
    ],
    callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = user.accessToken;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };