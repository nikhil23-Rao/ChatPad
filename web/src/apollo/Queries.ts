import { gql } from '@apollo/client';

export const GET_USER_ID = gql`
  query GetUserPassword($email: String!) {
    GetUserId(email: $email)
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    GetAllUsers {
      username
      email
      profile_picture
      id
    }
  }
`;

export const GET_GROUPS = gql`
  query GetGroups($authorid: String) {
    GetGroups(authorid: $authorid) {
      members {
        username
        email
        profile_picture
        id
      }
      messages {
        body
        messageid
        authorid
      }
      id
    }
  }
`;
