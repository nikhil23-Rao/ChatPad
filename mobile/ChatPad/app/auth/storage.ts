import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeUser = async (
  value: {
    username: string | null | undefined;
    email: string | null | undefined;
    id?: string | null | undefined;
    password?: any;
    dark_theme?: string | null | undefined;
    profile_picture: string | null | undefined;
  } | null
) => {
  try {
    await AsyncStorage.setItem("@user", JSON.stringify(value));
  } catch (e) {
    // saving error
    console.log("STORING ERR", e);
  }
};
