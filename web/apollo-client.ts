import { ApolloClient, InMemoryCache } from '@apollo/client';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const wsLink = process.browser
  ? new WebSocketLink({
      // if you instantiate in the server, the error will be thrown
      uri: `wss://chatpad-server.herokuapp.com/subscriptions`,
      // uri: 'ws://localhost:4000/subscriptions',
      options: {
        reconnect: true,
        timeout: 60000,
        lazy: true,
        minTimeout: 60000,
      },
    })
  : null;

const httplink = new HttpLink({
  uri: 'https://chatpad-server.herokuapp.com/graphql',
  // uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

const link = process.browser
  ? split(
      ({ query }) => {
        const { kind, operation }: any = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink as any,
      httplink,
    )
  : httplink;

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          GetMembers: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

export default client;
