import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feed from "../screens/Feed";

const AppTabNavigator = createMaterialBottomTabNavigator();

const AppNavigator = ({}: any) => {
  return (
    <AppTabNavigator.Navigator>
      <AppTabNavigator.Screen
        name={"Feed"}
        component={Feed}
        options={{
          tabBarIcon: () => <MaterialCommunityIcons name="home" size={26} />,
          tabBarColor: "#fff",
        }}
      />
    </AppTabNavigator.Navigator>
  );
};

export default AppNavigator;
