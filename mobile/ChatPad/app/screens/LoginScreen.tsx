import React, { useContext, useState } from "react";
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
import { client } from "../../App";
import { LOGIN } from "../apollo/Mutations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

interface IProps {}

const LoginScreen = ({}: IProps) => {
  const authContext = useContext(AuthContext);
  const [apolloError, setApolloError] = useState(false);
  return (
    <React.Fragment>
      <View style={LoginScreenStyles.container}>
        <Image
          source={require("../assets/chatpadphonelogo.png")}
          style={LoginScreenStyles.image}
        />
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setSubmitting(true);
              const result = await client.mutate({
                mutation: LOGIN,
                variables: {
                  email: values.email,
                  password: values.password,
                },
              });
              authContext.setUser(result.data.Login);
            } catch (err) {
              console.log(err);
              setApolloError(true);
            }
          }}
          validationSchema={loginValidationSchema}
        >
          {({ handleChange, handleSubmit, errors, touched, isSubmitting }) => {
            const isInvalidEmail = errors.email && touched.email ? true : false;
            const isInvalidPassword =
              errors.password && touched.password ? true : false;
            return (
              <React.Fragment>
                <SafeAreaView style={LoginScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidEmail || apolloError}
                    onChangeText={handleChange("email")}
                    icon="email"
                    placeholder="Email Address..."
                  />
                  <Text style={LoginScreenStyles.errTxtEmail}>
                    {(isInvalidEmail && errors.email) ||
                      (apolloError && "Invalid Email Or Password.")}
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
                  disabled={isSubmitting}
                  style={LoginScreenStyles.loginButton}
                  onPress={() => handleSubmit()}
                >
                  {!isSubmitting && (
                    <Text style={LoginScreenStyles.buttonText}>Login</Text>
                  )}
                  {isSubmitting && (
                    <MaterialCommunityIcons
                      style={LoginScreenStyles.buttonText}
                      name="loading"
                      size={20}
                    />
                  )}
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
