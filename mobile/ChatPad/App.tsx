import React from "react";
import { AuthStackNavigator } from "./app/navigation/AuthStackNavigator";
import WelcomeScreen from "./app/screens/WelcomeScreen";
import { AppRegistry } from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import AnimatedSplash from "react-native-animated-splash-screen";
import { useState } from "react";
import { useEffect } from "react";
import { AppNavigator } from "./app/navigation/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthContext from "./app/auth/context";
import Loader from "react-native-mask-loader";

export const client = new ApolloClient({
  uri: "https://chatpad-server.herokuapp.com/graphql",
  cache: new InMemoryCache(),
});
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(undefined);
  const getUser = async () => {
    const storedUser = await AsyncStorage.getItem("@user");
    if (!storedUser) return setUser(undefined);
    const currentUser = JSON.parse(storedUser);
    setUser(currentUser);
  };
  useEffect(() => {
    getUser();
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
  }, []);

  const wsLink = new WebSocketLink({
    // if you instantiate in the server, the error will be thrown
    uri: `wss://chatpad-server.herokuapp.com/subscriptions`,
    // uri: 'ws://localhost:4000/subscriptions',
    options: {
      reconnect: true,
      timeout: 60000,
      lazy: true,
    },
  });

  const httplink = new HttpLink({
    uri: "https://chatpad-server.herokuapp.com/graphql",
    // uri: 'http://localhost:4000/graphql',
    credentials: "same-origin",
  });

  const link = split(
    ({ query }) => {
      const { kind, operation }: any = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink as any,
    httplink
  );

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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <ApolloProvider client={client}>
        <Loader
          isLoaded={isLoaded}
          imageSource={require("./assets/mobilesplash.png")}
          backgroundStyle={{ backgroundColor: "#0078fe" }}
        >
          {user ? <AppNavigator /> : <AuthStackNavigator />}
        </Loader>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

AppRegistry.registerComponent("MyApplication", () => App);
