import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import TextField from "../components/TextField";
import { Formik } from "formik";
import { loginValidationSchema } from "../components/validation/LoginValidationSchema";

interface IProps {}

const LoginScreen = ({}: IProps) => {
  return (
    <React.Fragment>
      <View style={LoginScreenStyles.container}>
        <Image
          source={require("../assets/chatpadphonelogo.png")}
          style={LoginScreenStyles.image}
        />
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={(values) => console.log(values)}
          validationSchema={loginValidationSchema}
        >
          {({ handleChange, handleSubmit, errors, touched }) => {
            const isInvalidEmail = errors.email && touched.email ? true : false;
            const isInvalidPassword =
              errors.password && touched.password ? true : false;
            return (
              <React.Fragment>
                <SafeAreaView style={LoginScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidEmail}
                    onChangeText={handleChange("email")}
                    icon="email"
                    placeholder="Email Address..."
                  />
                  <Text style={LoginScreenStyles.errTxtEmail}>
                    {isInvalidEmail && errors.email}
                  </Text>
                </SafeAreaView>
                <SafeAreaView style={LoginScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidPassword}
                    onChangeText={handleChange("password")}
                    icon="lock"
                    placeholder="Password..."
                  />
                  <Text style={LoginScreenStyles.errTxtPassword}>
                    {isInvalidPassword && errors.password}
                  </Text>
                </SafeAreaView>
                <TouchableOpacity
                  style={LoginScreenStyles.loginButton}
                  onPress={() => handleSubmit()}
                >
                  <Text style={LoginScreenStyles.buttonText}>Login</Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          }}
        </Formik>
      </View>
    </React.Fragment>
  );
};

const LoginScreenStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  textFieldContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: 120,
  },
  loginButton: {
    width: "80%",
    alignSelf: "center",
    height: 50,
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#89D5D2",
    top: 150,
  },
  buttonText: {
    alignSelf: "center",
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "Helvetica-Bold",
  },
  image: {
    alignSelf: "center",
    top: 50,
  },
  errTxtEmail: {
    right: 80,
    color: "red",
    fontSize: 20,
  },
  errTxtPassword: {
    right: 60,
    color: "red",
    fontSize: 20,
  },
});

export default LoginScreen;
