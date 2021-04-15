import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($email: String!) {
    GetCurrentUser(email: $email)
  }
`;
