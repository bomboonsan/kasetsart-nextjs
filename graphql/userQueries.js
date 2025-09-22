import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      documentId
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($documentId: ID!) {
    usersPermissionsUser(documentId: $documentId) {
      username
      email
      firstNameTH
      lastNameTH
      firstNameEN
      lastNameEN
      academicPosition
      highDegree
      telephoneNo
      avatar {
        url
      }
      academic_types {
        documentId
      }
        participation
        departments {
          documentId
        }
        faculties {
          documentId
        }
        organizations {
          documentId
        }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      __typename
    }
  }
`;