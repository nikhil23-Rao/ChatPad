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

interface IProps {}

const WelcomeScreen = ({}: IProps) => {
  return (
    <React.Fragment>
      <View style={WelcomeScreenStyles.container}>
        <SafeAreaView>
          <Text style={WelcomeScreenStyles.text}>ChatPad</Text>
        </SafeAreaView>
        <Image
          style={WelcomeScreenStyles.image}
          source={require("../assets/guy.png")}
        />
        <TouchableOpacity
          style={WelcomeScreenStyles.loginButton}
          onPress={() => console.log("HELLO")}
        >
          <Text style={WelcomeScreenStyles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[WelcomeScreenStyles.registerButton]}>
          <Text style={WelcomeScreenStyles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
};

const WelcomeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#80CBC4",
  },
  image: {
    alignSelf: "center",
    top: 100,
  },
  text: {
    alignSelf: "center",
    fontSize: 60,
    color: "#37454F",
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  loginButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#87CEFA",
    top: 230,
  },
  registerButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#FFCCCB",
    top: 250,
  },
  buttonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#37454F",
  },
});

export default WelcomeScreen;
