import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatsScreen from "../screens/ChatsScreen";
import { useEffect } from "react";

const AppStack = createStackNavigator();

export const AppNavigator = () => {
  const getUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (data) console.log(JSON.parse(data));
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <NavigationContainer>
      <AppStack.Navigator>
        <AppStack.Screen
          name="Your Chats"
          options={{ headerTintColor: "#3D91E3" }}
          component={ChatsScreen}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};
