import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { ListItem, Avatar } from "react-native-elements";
import { useContext } from "react";
import AuthContext from "../auth/context";
import { useQuery } from "@apollo/client";
import { SEARCH_GROUPS } from "../apollo/Queries";
import { useEffect } from "react";

interface IProps {
  navigation: any;
}

const ChatsScreen = ({ navigation }: IProps) => {
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const authContext = useContext(AuthContext);
  const { data, loading } = useQuery(SEARCH_GROUPS, {
    variables: {
      query,
      authorid: authContext.user.id,
    },
  });

  return (
    <React.Fragment>
      <SafeAreaView style={ChatsScreenStyles.container}>
        <Image
          source={{ uri: authContext.user.profile_picture }}
          style={{
            height: 50,
            margin: 5,
            width: 50,
            position: "absolute",
            top: 45,
            left: 20,
            borderRadius: 100,
          }}
        />
        <FontAwesome
          name="user-plus"
          size={35}
          color="#1e1e1e"
          style={{
            position: "absolute",
            left: "84%",
            top: "7.5%",
            borderRadius: 100,
          }}
        />

        <SafeAreaView
          style={{
            flex: 1,
            top: 56,
            position: "absolute",
          }}
        >
          <Text style={ChatsScreenStyles.headerText}>Your Chats</Text>
        </SafeAreaView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            top: 430,
            position: "absolute",
          }}
        >
          <TextInput
            style={ChatsScreenStyles.search}
            placeholder="Search chats..."
            value={query}
            onChangeText={(text) => {
              setQuery(text);
            }}
          />
          <AntDesign
            name="search1"
            size={20}
            color="#C9C6C9"
            style={{ right: 23, alignSelf: "center", top: "-80%" }}
          />
        </View>
        <View style={{ width: "100%", top: "23%", position: "absolute" }}>
          {data &&
            data.SearchGroups.map((group: any) => {
              return (
                <>
                  <TouchableOpacity
                    key={group.id}
                    onPress={() =>
                      navigation.navigate("Messages", {
                        id: group.id,
                        name: group.name,
                      })
                    }
                  >
                    <View style={ChatsScreenStyles.listitem}>
                      {group.last_message.body !== null &&
                      group.last_message.author.id !== authContext.user.id &&
                      !group.last_message.read_by.includes(
                        authContext.user.id
                      ) ? (
                        <View style={ChatsScreenStyles.newmessagedot}></View>
                      ) : null}
                      <View>
                        {group.members.length === 2 ? (
                          <Image
                            source={{
                              uri:
                                group.members[0].id !== authContext.user.id
                                  ? group.members[0].profile_picture
                                  : group.members[1].profile_picture,
                            }}
                            style={{
                              height: 50,
                              margin: 5,
                              width: 50,
                              position: "absolute",
                              top: -20,
                              right: 317,
                              borderRadius: 100,
                            }}
                          />
                        ) : group.image.length === 0 &&
                          group.members.length >= 2 ? (
                          <>
                            <Image
                              source={{
                                uri: group.members[0].profile_picture,
                              }}
                              style={{
                                height: 31,
                                margin: 5,
                                width: 31,
                                position: "absolute",
                                top: 2,
                                right: 335,
                                borderRadius: 100,
                              }}
                            />
                            <Image
                              source={{
                                uri: group.members[1].profile_picture,
                              }}
                              style={{
                                height: 31,
                                margin: 5,
                                width: 31,
                                position: "absolute",
                                top: -20,
                                right: 324,
                                borderRadius: 100,
                              }}
                            />
                            {group.members.length > 2 ? (
                              <View
                                style={{
                                  borderRadius: 100,
                                  width: 31,
                                  left: 15,
                                  top: 10,
                                  height: 31,
                                  position: "absolute",
                                  backgroundColor: "#eee",
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#1e1e1e",
                                    alignSelf: "center",
                                    top: 5,
                                  }}
                                >
                                  +{group.members.length - 2}
                                </Text>
                              </View>
                            ) : null}
                          </>
                        ) : (
                          <Image
                            source={{ uri: group.image }}
                            style={{
                              height: 50,
                              margin: 5,
                              width: 50,
                              position: "absolute",
                              top: -20,
                              right: 317,
                              borderRadius: 100,
                            }}
                          />
                        )}
                      </View>
                      <View style={ChatsScreenStyles.groupnamecontainer}>
                        <Text
                          style={[
                            ChatsScreenStyles.groupname,
                            {
                              fontWeight:
                                group.last_message.body !== null &&
                                group.last_message.author.id !==
                                  authContext.user.id &&
                                !group.last_message.read_by.includes(
                                  authContext.user.id
                                )
                                  ? "bold"
                                  : "normal",
                            },
                          ]}
                        >
                          {group.members.length > 2
                            ? group.name
                            : group.members[0].id !== authContext.user.id
                            ? group.members[0].username
                            : group.members[1].username}
                        </Text>
                        {group.last_message.body === null ? null : (
                          <Text
                            style={[
                              ChatsScreenStyles.groupname,
                              {
                                fontSize: 18,
                                position: "absolute",
                                top: 25,
                                fontWeight:
                                  group.last_message.body !== null &&
                                  group.last_message.author.id !==
                                    authContext.user.id &&
                                  !group.last_message.read_by.includes(
                                    authContext.user.id
                                  )
                                    ? "bold"
                                    : "normal",
                              },
                            ]}
                          >
                            {group.last_message.author.username}:{" "}
                            {group.last_message.body.includes("has left") &&
                            group.last_message.alert
                              ? "(Left The Group)"
                              : group.last_message.alert &&
                                group.last_message.body.includes("kicked")
                              ? "(Kicked Member From Group)"
                              : group.last_message.alert &&
                                !group.last_message.body.includes("kicked") &&
                                !group.last_message.body.includes("added") &&
                                !group.last_message.body.includes("left")
                              ? "(Changed The Group Name)"
                              : group.last_message.body.includes("added") &&
                                group.last_message.alert
                              ? "(Added Member To Group)"
                              : group.last_message.body.length <= 13
                              ? group.last_message.body
                              : `${group.last_message.body.substr(0, 15)}...`}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              );
            })}
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const ChatsScreenStyles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#fff",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 28,
  },
  search: {
    backgroundColor: "#F1EFF2",
    alignSelf: "center",
    width: "90%",
    borderRadius: 12,
    padding: 10,
    left: 10,
    top: "-80%",
  },
  listitem: {
    width: "100%",
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    padding: 25,
  },
  groupnamecontainer: {
    left: "18%",
    top: -10,
  },
  groupname: {
    fontFamily: "Helvetica Neue",
    fontSize: 20,
    fontWeight: "300",
  },
  newmessagedot: {
    height: 20,
    width: 20,
    backgroundColor: "#0098fd",
    borderRadius: 100,
    position: "absolute",
    alignSelf: "flex-end",
    top: 30,
    right: 25,
  },
});

export default ChatsScreen;
