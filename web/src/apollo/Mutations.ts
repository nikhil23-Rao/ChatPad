import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($email: String!, $username: String!, $password: String!, $profile_picture: String, $id: String) {
    Register(username: $username, password: $password, email: $email, profile_picture: $profile_picture, id: $id)
  }
`;
