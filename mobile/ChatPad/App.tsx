import React from "react";
import { AuthStackNavigator } from "./app/navigation/AuthStackNavigator";
import WelcomeScreen from "./app/screens/WelcomeScreen";
import { AppRegistry } from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
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
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <ApolloProvider client={client}>
        {/* <AnimatedSplash
          translucent={false}
          isLoaded={isLoaded}
          logoImage={require("./assets/mobilesplash.png")}
          backgroundColor={"#0078fe"}
          logoHeight={200}
          logoWidth={200}
        > */}
        <Loader
          isLoaded={isLoaded}
          imageSource={require("./assets/mobilesplash.png")}
          backgroundStyle={{ backgroundColor: "#0078fe" }}
        >
          {user ? <AppNavigator /> : <AuthStackNavigator />}
          {/* </AnimatedSplash> */}
        </Loader>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

AppRegistry.registerComponent("MyApplication", () => App);
