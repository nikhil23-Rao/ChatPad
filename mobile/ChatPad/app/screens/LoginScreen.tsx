import "react-native-gesture-handler";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import * as Google from "expo-google-app-auth";
import { AntDesign } from "@expo/vector-icons";
import { client } from "../../App";
import { LOGIN, REGISTER } from "../apollo/Mutations";
import { generateId } from "../utils/generateId";
import { storeUser } from "../auth/storage";

export default function LoginScreen({ navigation }: any) {
  async function signInWithGoogleAsync() {
    try {
      const result = await Google.logInAsync({
        behavior: "web",
        iosClientId:
          "145764687586-h86f2731jjct3l1p5lpq68g9vedp8vmn.apps.googleusercontent.com",
        //androidClientId: AND_CLIENT_ID,
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        try {
          const id = generateId(24);
          await client.mutate({
            mutation: REGISTER,
            variables: {
              username: result.user.name,
              email: result.user.email,
              password: generateId(15),
              profile_picture: result.user.photoUrl,
              id,
              oauth: true,
            },
          });
          await storeUser({
            username: result.user.name,
            email: result.user.email,
            password: "",
            profile_picture: result.user.photoUrl,
          });
          navigation.navigate("ChatPad");
        } catch (err) {
          try {
            await client.mutate({
              mutation: LOGIN,
              variables: {
                email: result.user.email,
              },
            });
            await storeUser({
              username: result.user.name,
              email: result.user.email,
              password: "",
              profile_picture: result.user.photoUrl,
            });
            navigation.navigate("ChatPad");
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }
  const signInWithGoogle = () => {
    signInWithGoogleAsync();
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <AntDesign
        name="message1"
        size={120}
        style={{ top: 120 }}
        color="#007bff"
      />
      <TouchableOpacity
        style={[
          LoginScreenStyles.button,
          {
            backgroundColor: "#de5246",
            marginTop: 220,
          },
        ]}
        onPress={() => signInWithGoogle()}
      >
        <Text style={LoginScreenStyles.buttonText}>
          <View style={{ marginRight: 2, position: "relative" }}>
            <AntDesign name="google" size={20} color="#fff" />
          </View>{" "}
          Continue With Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          LoginScreenStyles.button,
          {
            backgroundColor: "#000",
            marginTop: 15,
          },
        ]}
        onPress={() => signInWithGoogle()}
      >
        <Text style={LoginScreenStyles.buttonText}>
          <View style={{ marginRight: 2, position: "relative" }}>
            <AntDesign name="github" size={20} color="#fff" />
          </View>{" "}
          Continue With GitHub
        </Text>
      </TouchableOpacity>
      <Image
        source={require("../../assets/mobilewaveborder.png")}
        style={{ width: 820, position: "relative", top: 120 }}
      />
    </View>
  );
}

const LoginScreenStyles = StyleSheet.create({
  button: {
    width: "90%",
    height: 50,
    borderRadius: 25,
    padding: 12,
  },
  buttonText: {
    marginRight: "auto",
    marginLeft: "auto",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
