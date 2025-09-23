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
      education
      academic_types {
        documentId
      }
        participation
        departments {
          documentId
          title
        }
        faculties {
          documentId
          title
        }
        organizations {
          documentId
          title
        }
    }
  }
`;

export const GET_PROFILE_OPTIONS = gql`
  query GetProfileOptions {
    academicTypes {
      documentId
      name
    }
    departments {
      documentId
      title
    }
    faculties {
      documentId
      title
    }
    organizations {
      documentId
      title
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
