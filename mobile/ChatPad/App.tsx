import React from "react";
import { AuthStackNavigator } from "./app/navigation/AuthStackNavigator";
import WelcomeScreen from "./app/screens/WelcomeScreen";
import { AppRegistry } from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import AnimatedSplash from "react-native-animated-splash-screen";
import { useState } from "react";
import { useEffect } from "react";

export const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
  }, []);
  return (
    <ApolloProvider client={client}>
      <AnimatedSplash
        translucent={true}
        isLoaded={isLoaded}
        logoImage={require("./assets/mobilesplash.png")}
        backgroundColor={"#0078fe"}
        logoHeight={200}
        logoWidth={200}
      >
        <AuthStackNavigator />
      </AnimatedSplash>
    </ApolloProvider>
  );
}

AppRegistry.registerComponent("MyApplication", () => App);
