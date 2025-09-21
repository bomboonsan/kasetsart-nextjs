
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = getClient();
        try {
          const { data } = await client.mutate({
            mutation: gql`
              mutation ($identifier: String!, $password: String!) {
                login(input: { identifier: $identifier, password: $password }) {
                  jwt
                  user {
                    id
                    username
                    email
                    documentId
                  }
                }
              }
            `,
            variables: {
              identifier: credentials.email,
              password: credentials.password,
            },
          });

          if (data && data.login) {
            return { ...data.login.user, jwt: data.login.jwt };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.documentId = user.documentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.jwt = token.jwt;
        session.user.documentId = token.documentId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
