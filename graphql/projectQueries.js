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
