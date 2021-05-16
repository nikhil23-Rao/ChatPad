import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $username: String!
    $password: String
    $profile_picture: String
    $id: String
    $oauth: Boolean
  ) {
    Register(
      username: $username
      password: $password
      email: $email
      profile_picture: $profile_picture
      id: $id
      oauth: $oauth
    )
  }
`;

export const LOGIN = gql`
  mutation Register($email: String!, $password: String) {
    Login(email: $email, password: $password)
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($id: String, $members: [User], $name: String) {
    CreateGroup(id: $id, members: $members, name: $name)
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $groupid: String
    $body: String
    $author: User
    $messageid: String
    $image: Boolean
    $time: String
    $date: String
    $day: String
  ) {
    SendMessage(
      groupid: $groupid
      body: $body
      author: $author
      messageid: $messageid
      image: $image
      time: $time
      day: $day
      date: $date
    )
  }
`;

export const START_SUBSCRIPTION = gql`
  mutation StartSubscription($groupid: String, $messageid: String) {
    StartSubscription(groupid: $groupid, messageid: $messageid)
  }
`;

export const TOGGLE_THEME = gql`
  mutation ToggleTheme($authorid: String) {
    ToggleTheme(authorid: $authorid)
  }
`;

export const UPDATE_TIME = gql`
  mutation UpdateTime {
    UpdateTime
  }
`;

export const SWITCH_ONLINE = gql`
  mutation SwitchOnline($authorid: String, $value: Boolean) {
    SwitchOnline(authorid: $authorid, value: $value)
  }
`;

export const SET_CHAT_ON = gql`
  mutation SetChatOn($authorid: String, $groupid: String) {
    SetChatOn(authorid: $authorid, groupid: $groupid)
  }
`;
