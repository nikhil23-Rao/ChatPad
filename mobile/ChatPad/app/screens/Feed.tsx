import React from "react";
import { Button, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import storage from "../../auth/storage";

interface IProps {}

const Feed = ({}: IProps) => {
  return (
    <React.Fragment>
      <SafeAreaView>
        <Button
          title="LOGOUT"
          onPress={async () => await storage.removeToken()}
        />
      </SafeAreaView>
    </React.Fragment>
  );
};

const FeedStyles = StyleSheet.create({});

export default Feed;
