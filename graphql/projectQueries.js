import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects($pagination: PaginationArg, $filters: ProjectFiltersInput, $sort: [String]) {
    projects(pagination: $pagination, filters: $filters, sort: $sort) {
      documentId
      nameTH
      nameEN
      fiscalYear
      budget
      publishedAt
      updatedAt
      partners
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
      partners
    }
  }
`;
