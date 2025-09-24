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
      documentId
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
      projects {        
        documentId
        nameEN
        nameTH
        attachments {
          documentId
          name
          url
          size
          mime
        }
        conferences {
          documentId
          titleEN
          titleTH
          attachments {
            documentId
            name
            url
            size
            mime
          }
        }
        publications {
          documentId
          titleEN
          titleTH
          attachments {
            documentId
            name
            url
            size
            mime
          }
        }
      }
      funds {
        documentId
        contentDesc
        attachments {
          documentId
          name
          url
          size
          mime
        }
        books {
          documentId
          titleTH
          titleEN
          attachments {
            documentId
            name
            url
            size
            mime
          }
        }
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

export const GET_ALL_USERS = gql`
  query GetAllUsers($pagination: PaginationArg, $filters: UsersPermissionsUserFiltersInput) {
    usersPermissionsUsers(pagination: $pagination, filters: $filters) {
      documentId
      username
      email
      firstNameTH
      lastNameTH
      firstNameEN
      lastNameEN
      academicPosition
      departments { documentId title }
      faculties { documentId title }
      organizations { documentId title }
      role { name documentId }
      blocked
    }
  }
`;

// อัปเดตบทบาท: ส่ง role เป็น ID โดยตรง
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $roleId: ID!) {
    updateUsersPermissionsUser(
      id: $id
      data: { role: $roleId }
    ) {
      data {
        documentId
        role { documentId name }
      }
    }
  }
`;

// บล็อก/ยกเลิกบล็อก
export const UPDATE_USER_BLOCKED = gql`
  mutation UpdateUserBlocked($id: ID!, $blocked: Boolean!) {
    updateUsersPermissionsUser(
      id: $id
      data: { blocked: $blocked }
    ) {
      data { documentId blocked }
    }
  }
`;