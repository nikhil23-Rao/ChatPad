import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";

const AuthStack = createStackNavigator();

export const AuthStackNavigator = () => {
  return (
    <NavigationContainer>
      <AuthStack.Navigator>
        <AuthStack.Screen
          name="Back"
          options={{ headerShown: false }}
          component={WelcomeScreen}
        />
        <AuthStack.Screen
          name="ChatPad Login"
          options={{ headerTintColor: "#3D91E3" }}
          component={LoginScreen}
        />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};
