import { gql } from '@apollo/client';

export const GET_USER_PASSWORD = gql`
  query GetUserPassword($email: String!) {
    GetUserPassword(email: $email)
  }
`;
