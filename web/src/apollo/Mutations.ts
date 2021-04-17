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
