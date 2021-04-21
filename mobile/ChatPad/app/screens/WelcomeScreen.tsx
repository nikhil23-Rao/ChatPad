import { NavigationProp } from "@react-navigation/core";
import { ParamListBase } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
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
        <Image
          source={require("../assets/people.png")}
          style={WelcomeScreenStyles.image}
        />
        <SafeAreaView>
          <Text style={WelcomeScreenStyles.text}>ChatPad</Text>
        </SafeAreaView>
        <SafeAreaView>
          <Text style={WelcomeScreenStyles.subText}>
            Chat with friends & family. Anytime, anywhere.
          </Text>
        </SafeAreaView>
        <TouchableOpacity
          style={[WelcomeScreenStyles.registerButton]}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={WelcomeScreenStyles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={WelcomeScreenStyles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={WelcomeScreenStyles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
};

const WelcomeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  image: {
    alignSelf: "center",
    top: 50,
  },
  text: {
    alignSelf: "center",
    fontSize: 30,
    color: "#37454F",
    top: 40,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  subText: {
    color: "#B3B3B7",
    alignSelf: "center",
    fontSize: 17,
    top: 60,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  loginButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    top: 260,
  },
  registerButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#076AFF",
    top: 250,
    shadowOpacity: 0.2,
  },
  registerButtonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  loginButtonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#076AFF",
    fontFamily: "Helvetica-Bold",
  },
});

export default WelcomeScreen;
