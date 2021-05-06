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
    }
  }
`;
