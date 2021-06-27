import { gql } from '@apollo/client';

export const GET_USER_ID = gql`
  query GetUserPassword($email: String!) {
    GetUserId(email: $email)
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    GetAllUsers
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
    GetInitialMessages(groupid: $groupid, limit: $limit, offset: $offset)
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
      dm
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
      dm
      id
      last_message {
        image
        alert
        read_by
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
      read_by
      alert
    }
  }
`;

export const GET_NOT_READ = gql`
  query GetNotRead($authorid: String, $groupid: String) {
    GetNotRead(authorid: $authorid, groupid: $groupid)
  }
`;
