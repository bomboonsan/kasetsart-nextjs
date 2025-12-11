'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import { getClient } from '@/lib/apollo-client';

// Add BigInt serialization support for JSON.stringify
// This ensures BigInt values can be serialized in GraphQL queries/mutations
if (typeof BigInt !== "undefined" && !BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

export default function ApolloProvider({ children }) {
  return <Provider client={getClient()}>{children}</Provider>;
}
