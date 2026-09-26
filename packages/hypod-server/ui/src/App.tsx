import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Suspense, lazy } from 'react';

const PluridShell = lazy(() => import('./PluridShell'));

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: '/graphql',
    credentials: 'same-origin',
  }),
});

export const App = () => (
  <ApolloProvider client={graphqlClient}>
    <Suspense fallback={<div className="application-loading">Preparing registry workspace…</div>}>
      <PluridShell />
    </Suspense>
  </ApolloProvider>
);
