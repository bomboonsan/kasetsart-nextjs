
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";

export const authOptions = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Don't call `getClient()` here because it uses `getSession()` which
        // triggers a request to `/api/auth` and causes a recursive loop when
        // this authorize() is running. Use a direct fetch to the GraphQL
        // endpoint for the login mutation instead.
        try {
          const graphqlUrl =
            process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_API_URL ||
            "http://localhost:1338/graphql";

          const query = `mutation ($identifier: String!, $password: String!) {\n` +
            `  login(input: { identifier: $identifier, password: $password }) {\n` +
            `    jwt\n` +
            `    user { id username email documentId }\n` +
            `  }\n` +
            `}`;

          const resp = await fetch(graphqlUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              variables: {
                identifier: credentials.email,
                password: credentials.password,
              },
            }),
          });

          // If server returned non-OK, capture body for diagnosis
          if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            console.error("GraphQL endpoint returned non-OK status:", resp.status, text);
            throw new Error(`Authentication service unavailable (status ${resp.status})`);
          }

          const json = await resp.json().catch((e) => {
            console.error('Failed to parse JSON from GraphQL response', e);
            throw new Error('Invalid response from authentication service');
          });

          // GraphQL may return errors array
          if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
            console.error('GraphQL errors on login:', json.errors);
            // Surface first error message to NextAuth so it can be shown to the user
            throw new Error(json.errors[0].message || 'Login failed');
          }

          const data = json?.data;
          if (data && data.login) {
            return { ...data.login.user, jwt: data.login.jwt };
          }

          // No login data -> invalid credentials
          console.warn('Login mutation returned no login data', json);
          // Throwing makes NextAuth redirect with an error code we can inspect
          throw new Error('Invalid email or password');
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
