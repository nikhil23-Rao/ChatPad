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
  mutation CreateGroup($id: String, $members: [User], $name: String, $image: String, $dm: Boolean) {
    CreateGroup(id: $id, members: $members, name: $name, image: $image, dm: $dm)
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
    $alert: Boolean
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
      alert: $alert
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
  mutation SwitchOnline($authorid: String, $value: Boolean, $groupid: String) {
    SwitchOnline(authorid: $authorid, value: $value, groupid: $groupid)
  }
`;

export const SET_CHAT_ON = gql`
  mutation SetChatOn($authorid: String, $groupid: String) {
    SetChatOn(authorid: $authorid, groupid: $groupid)
  }
`;

export const SET_USER_TYPING = gql`
  mutation SetUserTyping($authorid: String, $groupid: String, $value: Boolean) {
    SetUserTyping(authorid: $authorid, value: $value, groupid: $groupid)
  }
`;

export const ADD_READ_BY = gql`
  mutation AddReadBy($messageid: String, $member: String) {
    AddReadBy(messageid: $messageid, member: $member)
  }
`;

export const CHANGE_GROUP_NAME = gql`
  mutation ChangeGroupName($groupid: String, $value: String) {
    ChangeGroupName(groupid: $groupid, value: $value)
  }
`;

export const KICK_MEMBERS = gql`
  mutation KickMembers($memberid: String, $groupid: String) {
    KickMembers(memberid: $memberid, groupid: $groupid)
  }
`;

export const ADD_MEMBERS = gql`
  mutation AddMembers($members: [User], $groupid: String) {
    AddMembers(members: $members, groupid: $groupid)
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($groupid: String) {
    DeleteConversation(groupid: $groupid)
  }
`;
