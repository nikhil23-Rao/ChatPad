import { gql } from '@apollo/client';

export const GET_ALL_MESSAGES = gql`
  subscription GetAllMessages {
    GetAllMessages {
      body
      messageid
      authorid
    }
  }
`;
