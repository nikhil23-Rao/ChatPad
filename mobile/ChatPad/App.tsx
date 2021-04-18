import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStackNavigator from "./app/navigation/AuthStackNavigator";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { AppRegistry } from "react-native";
import AppNavigator from "./app/navigation/AppStackNavigator";
import storage from "./auth/storage";
import AppLoading from "expo-app-loading";
import { AuthContext } from "./context/AuthContext";

export const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  const [user, setUser] = useState<string | null | undefined | unknown>("");
  const [isReady, setIsReady] = useState(false);
  const restoreUser = async () => {
    const user = await storage.getUser();
    setUser(user);
  };
  if (!isReady) {
    return (
      <AppLoading
        startAsync={restoreUser}
        onFinish={() => setIsReady(true)}
        onError={(error) => console.log(error)}
      />
    );
  }
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        {user ? <AppNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

AppRegistry.registerComponent("App", () => App);
