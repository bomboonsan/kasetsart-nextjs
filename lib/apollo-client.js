
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

// Add BigInt serialization support for JSON.stringify globally
if (typeof BigInt !== "undefined" && !BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

/**
 * Recursively sanitize an object by converting BigInt to string
 * This ensures GraphQL mutations don't fail with BigInt serialization errors
 */
const sanitizeBigInt = (input) => {
  if (input === null || input === undefined) {
    return input;
  }
  if (typeof input === 'bigint') {
    return input.toString();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeBigInt);
  }
  if (typeof input === 'object') {
    const result = {};
    for (const key of Object.keys(input)) {
      result[key] = sanitizeBigInt(input[key]);
    }
    return result;
  }
  return input;
};

// Custom link to sanitize BigInt values in variables before sending
const sanitizeBigIntLink = new ApolloLink((operation, forward) => {
  // Sanitize the variables to convert BigInt to string
  if (operation.variables) {
    operation.variables = sanitizeBigInt(operation.variables);
  }
  return forward(operation);
});

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_API_URL || "http://localhost:1338/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  const token = session?.jwt;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

let client;

export const getClient = () => {
  if (!client) {
    client = new ApolloClient({
      // Chain: sanitizeBigInt -> auth -> http
      link: sanitizeBigIntLink.concat(authLink.concat(httpLink)),
      cache: new InMemoryCache(),
    });
  }
  return client;
};
