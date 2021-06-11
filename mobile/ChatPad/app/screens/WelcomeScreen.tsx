import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

interface IProps {
  navigation: any;
}

const WelcomeScreen = ({ navigation }: IProps) => {
  return (
    <React.Fragment>
      <SafeAreaView style={WelcomeScreenStyles.container}>
        <Image
          source={require("../../assets/people.png")}
          style={{ width: 450, bottom: 100, position: "relative" }}
        />
        <Text style={WelcomeScreenStyles.text}>
          A Real Way To Connect With Friends & Family.
        </Text>
        <TouchableOpacity
          style={[
            WelcomeScreenStyles.button,
            {
              backgroundColor: "dodgerblue",
              marginTop: 50,
            },
          ]}
          onPress={() => navigation.navigate("ChatPad Login")}
        >
          <Text style={WelcomeScreenStyles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </React.Fragment>
  );
};

const WelcomeScreenStyles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFDFD",
    flex: 1,
    position: "relative",
  },
  text: {
    fontWeight: "bold",
    color: "gray",
    alignSelf: "center",
    fontSize: 18,
    position: "relative",
    bottom: 100,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 25,
    padding: 12,
    bottom: 100,
  },
  buttonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default WelcomeScreen;
