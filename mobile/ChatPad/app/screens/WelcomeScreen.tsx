import { NavigationProp } from "@react-navigation/core";
import { ParamListBase } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-elements";

interface IProps {
  navigation: NavigationProp<ParamListBase, string>;
}

const WelcomeScreen = ({ navigation }: IProps) => {
  return (
    <React.Fragment>
      <View style={WelcomeScreenStyles.container}>
        <SafeAreaView>
          <Text style={WelcomeScreenStyles.text}>ChatPad</Text>
        </SafeAreaView>
        <Image
          source={require("../assets/chatpadphonelogo.png")}
          style={WelcomeScreenStyles.image}
        />
        <TouchableOpacity
          style={WelcomeScreenStyles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={WelcomeScreenStyles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[WelcomeScreenStyles.registerButton]}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={WelcomeScreenStyles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
};

const WelcomeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    alignSelf: "center",
    top: 200,
  },
  text: {
    alignSelf: "center",
    fontSize: 40,
    color: "#37454F",
    top: 100,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  loginButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#89D5D2",
    top: 390,
  },
  registerButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#FBA095",
    top: 410,
  },
  buttonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "Helvetica-Bold",
  },
});

export default WelcomeScreen;
