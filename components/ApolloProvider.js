'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import { getClient } from '@/lib/apollo-client';

export default function ApolloProvider({ children }) {
  return <Provider client={getClient()}>{children}</Provider>;
}
