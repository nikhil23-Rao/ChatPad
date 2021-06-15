import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatsScreen from "../screens/ChatsScreen";
import { useEffect } from "react";
import MeScreen from "../screens/MeScreen";
import { AntDesign } from "@expo/vector-icons";
import { MessageStackNavigator } from "./MessageNavigator";

const AppTab = createBottomTabNavigator();

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
      <AppTab.Navigator
        tabBarOptions={{
          activeTintColor: "#000",
        }}
      >
        <AppTab.Screen
          name="Chats"
          options={({ navigation }) => ({
            title: "Your Chats",
            tabBarIcon: ({ color, size }) => (
              <AntDesign color={color} size={size} name="message1" />
            ),
          })}
          component={MessageStackNavigator}
        />
        <AppTab.Screen
          name="Me"
          options={{
            title: "My Account",
            tabBarIcon: ({ color, size }) => (
              <AntDesign color={color} size={size} name="user" />
            ),
          }}
          component={MeScreen}
        />
      </AppTab.Navigator>
    </NavigationContainer>
  );
};
