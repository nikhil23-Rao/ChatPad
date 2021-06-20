import { gql } from '@apollo/client';

export const GET_ALL_MESSAGES = gql`
  subscription GetAllMessages {
    GetAllMessages {
      body
      messageid
      author {
        username
        email
        profile_picture
        id
      }
      image
      groupid
      time
      date
      read_by
      alert
    }
  }
`;

export const GET_USERS_TYPING = gql`
  subscription GetUsersTyping {
    GetUsersTyping {
      typing
      profile_picture
      online
      id
      chaton
    }
  }
`;
