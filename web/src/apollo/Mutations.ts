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
  mutation SendMessage($groupid: String, $body: String, $author: User, $messageid: String, $image: Boolean) {
    SendMessage(groupid: $groupid, body: $body, author: $author, messageid: $messageid, image: $image)
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
