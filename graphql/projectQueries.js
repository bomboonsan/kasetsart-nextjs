import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects($pagination: PaginationArg, $filters: ProjectFiltersInput, $sort: [String]) {
    projects(pagination: $pagination, filters: $filters, sort: $sort) {
      documentId
      nameTH
      nameEN
      fiscalYear
      isEnvironmentallySustainable
      durationStart
      durationEnd
      keywords
      fundName
      budget
      publishedAt
      updatedAt
      createdAt
      departments { documentId title }
      projectType
      partners
      users_permissions_users { 
        documentId 
        departments { documentId title } 
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($documentId: ID!) {
    project(documentId: $documentId) {
      documentId
      fiscalYear
      projectType
      projectMode
      subProjectCount
      nameTH
      nameEN
      isEnvironmentallySustainable
      durationStart
      durationEnd
      researchKind
      fundType
      fundSubType
      fundName
      budget
      keywords
      ic_types { documentId name }
      impacts { documentId name }
      sdgs { documentId name }
      departments { documentId title }
      attachments { 
        documentId
        name
        url
        size
        mime
      }
      partners
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($documentId: ID!) {
    deleteProject(documentId: $documentId) {
      documentId
    }
  }
`;
