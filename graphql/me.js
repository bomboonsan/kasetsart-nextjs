import { gql } from "@apollo/client";

export const MY_PROJECTS = gql`
    query GetProjects($pagination: PaginationArg, $sort: [String], $userId: ID!) {
        projects(pagination: $pagination, sort: $sort, filters: { users_permissions_users: { documentId: { eq: $userId } } }) {
            documentId
            nameTH
            nameEN
            fiscalYear
            isEnvironmentallySustainable
            keywords
            fundName
            budget
            publishedAt
            updatedAt
            departments { documentId title }
            projectType
            partners
        }
    }
`;
export const MY_CONFERENCES = gql`
  query GetConferences($pagination: PaginationArg, $sort: [String], $userId: ID!) {
    conferences(
      pagination: $pagination
      sort: $sort
      filters: {
        projects: {
          users_permissions_users: { documentId: { eq: $userId } }
        }
      }
    ) {
      documentId
      titleTH
      titleEN
      journalName
      durationStart
      durationEnd
      level
      country
      state
      city
      publishedAt
      updatedAt
      projects {
        documentId
        nameTH
        nameEN
      }
    }
  }
`;

export const MY_PUBLICATIONS = gql`
  query GetPublications($pagination: PaginationArg, $sort: [String], $userId: ID!) {
    publications(
      pagination: $pagination
      sort: $sort
      filters: {
        projects: { users_permissions_users: { documentId: { eq: $userId } } }
      }
    ) {
      documentId
      titleTH
      titleEN
      journalName
      volume
      issue
      pageStart
      pageEnd
      level
      updatedAt
      projects {
        documentId
        nameTH
        nameEN
      }
    }
  }
`;

export const MY_FUNDS = gql`
    query GetFunds($pagination: PaginationArg, $sort: [String], $userId: ID!) {
        funds(pagination: $pagination, sort: $sort, filters: { users_permissions_users: { documentId: { eq: $userId } } }) {
            documentId
            contentDesc
            fundType
            fundTypeText
            duration
            pages
            updatedAt
            partners
        }
    }
`;