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
import { registerValidationSchema } from "../components/validation/RegisterValidationSchema";
import { client } from "../../App";
import { REGISTER } from "../apollo/Mutations";
import { generateId } from "../utils/generateId";
import { AuthContext } from "../../context/AuthContext";
import storage from "../../auth/storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface IProps {}

const RegisterScreen = ({}: IProps) => {
  const authContext = useContext(AuthContext);
  const [apolloError, setApolloError] = useState(false);
  return (
    <React.Fragment>
      <View style={RegisterScreenStyles.container}>
        <Image
          source={require("../assets/chatpadphonelogo.png")}
          style={RegisterScreenStyles.image}
        />
        <Formik
          initialValues={{ email: "", password: "", username: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setSubmitting(true);
              const result = await client.mutate({
                mutation: REGISTER,
                variables: {
                  username: values.username,
                  email: values.email,
                  password: values.password,
                  id: generateId(24),
                  oauth: false,
                },
              });
              authContext.setUser(result.data.Register);
            } catch (err) {
              return setApolloError(true);
            }
          }}
          validationSchema={registerValidationSchema}
        >
          {({ handleChange, handleSubmit, errors, touched, isSubmitting }) => {
            const isInvalidEmail = errors.email && touched.email ? true : false;
            const isInvalidPassword =
              errors.password && touched.password ? true : false;
            const isInvalidUsername =
              errors.username && touched.username ? true : false;
            return (
              <React.Fragment>
                <SafeAreaView style={RegisterScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidEmail || apolloError}
                    onChangeText={handleChange("email")}
                    icon="email"
                    placeholder="Email Address..."
                  />
                  <Text style={RegisterScreenStyles.errTxtEmail}>
                    {(isInvalidEmail && errors.email) ||
                      (apolloError &&
                        "Account With The Given Email Already Exists.")}
                  </Text>
                </SafeAreaView>
                <SafeAreaView style={RegisterScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidUsername}
                    onChangeText={handleChange("username")}
                    icon="account"
                    placeholder="Username..."
                  />
                  <Text style={RegisterScreenStyles.errTxtPassword}>
                    {isInvalidUsername && errors.username}
                  </Text>
                </SafeAreaView>
                <SafeAreaView style={RegisterScreenStyles.textFieldContainer}>
                  <TextField
                    isInvalid={isInvalidPassword}
                    onChangeText={handleChange("password")}
                    icon="lock"
                    secureTextEntry={true}
                    placeholder="Password..."
                  />
                  <Text style={RegisterScreenStyles.errTxtPassword}>
                    {isInvalidPassword && errors.password}
                  </Text>
                </SafeAreaView>
                <TouchableOpacity
                  disabled={isSubmitting}
                  style={RegisterScreenStyles.RegisterButton}
                  onPress={() => handleSubmit()}
                >
                  {!isSubmitting && (
                    <Text style={RegisterScreenStyles.buttonText}>
                      Register
                    </Text>
                  )}
                  {isSubmitting && (
                    <MaterialCommunityIcons
                      style={RegisterScreenStyles.buttonText}
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

const RegisterScreenStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  textFieldContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: 120,
  },
  RegisterButton: {
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
    right: 50,
    color: "red",
    fontSize: 20,
  },
});

export default RegisterScreen;
