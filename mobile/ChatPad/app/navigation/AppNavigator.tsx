import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatsScreen from "../screens/ChatsScreen";
import { useEffect } from "react";
import MeScreen from "../screens/MeScreen";
import { AntDesign } from "@expo/vector-icons";
import { MessageStackNavigator } from "./MessageNavigator";
import { useContext } from "react";
import AuthContext from "../auth/context";

const AppTab = createBottomTabNavigator();

export const AppNavigator = () => {
  const getUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (data) console.log(JSON.parse(data));
  };
  useEffect(() => {
    getUser();
  }, []);
  const authContext = useContext(AuthContext);
  return (
    <NavigationContainer>
      <AppTab.Navigator
        tabBarOptions={{
          style: {
            backgroundColor: "transparent",
            borderTopWidth: authContext.user.dark_theme === "true" ? 0.22 : 0.4,
            position: "absolute",
            left: 50,
            right: 50,
            bottom: 20,
            height: 100,
          },
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
