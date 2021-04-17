import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TextFieldProps {
  icon: string | any;
  style?: object;
  placeholder: string;
  onChangeText?: ((text: string) => void) | undefined;
  onBlur?:
    | ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void)
    | undefined;
  isInvalid: boolean;
  secureTextEntry?: boolean;
}

const TextField = ({
  icon,
  style,
  placeholder,
  onChangeText,
  onBlur,
  isInvalid,
  secureTextEntry = false,
}: TextFieldProps) => {
  return (
    <View
      style={[
        styles.container,
        style,
        isInvalid && { borderWidth: 3, borderColor: "red" },
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={"#6e6969"}
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.textInput}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={"#6e6969"}
        placeholder={placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#faf4f4",
    flexDirection: "row",
    padding: 15,
    width: "90%",
    marginVertical: 10,
    borderRadius: 25,
  },
  textInput: {
    color: "#0c0c0c",
    fontSize: 18,
    fontFamily: "Avenir",
  },
  icon: {
    marginRight: 10,
  },
});

export default TextField;
