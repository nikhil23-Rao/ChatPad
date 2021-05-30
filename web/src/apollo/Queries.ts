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
      online
      chaton
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
        online
        chaton
        typing
      }
      id
      name
      image
    }
  }
`;

export const GET_INITIAL_MESSAGES = gql`
  query GetInitialMessages($groupid: String, $limit: Int, $offset: Int) {
    GetInitialMessages(groupid: $groupid, limit: $limit, offset: $offset) {
      body
      messageid
      author {
        username
        email
        profile_picture
        id
      }
      image
      time
      date
    }
  }
`;

export const GET_CHAT_PATHS = gql`
  query GetChatPaths {
    GetChatPaths
  }
`;

export const GET_GROUP_NAME = gql`
  query GetGroupName($groupid: String) {
    GetGroupName(groupid: $groupid) {
      members {
        username
        profile_picture
        email
        id
        online
        chaton
        typing
      }
      name
      id
      image
    }
  }
`;

export const SEARCH_GROUPS = gql`
  query SearchGroups($query: String, $authorid: String) {
    SearchGroups(query: $query, authorid: $authorid) {
      members {
        username
        profile_picture
        email
        id
        online
        chaton
        typing
      }
      name
      id
      last_message {
        body
        messageid
        author {
          username
          email
          profile_picture
          id
        }
      }
      image
    }
  }
`;

export const GET_MEMBERS = gql`
  query GetMembers($groupid: String) {
    GetMembers(groupid: $groupid) {
      username
      email
      profile_picture
      id
      online
      chaton
      typing
    }
  }
`;

export const LOAD_MORE = gql`
  query LoadMore($limit: Int, $offset: Int, $groupid: String) {
    LoadMore(limit: $limit, offset: $offset, groupid: $groupid) {
      body
      messageid
      author {
        username
        email
        profile_picture
        id
      }
      image
      time
      date
    }
  }
`;
