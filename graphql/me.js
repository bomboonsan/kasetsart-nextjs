import { gql } from "@apollo/client";

export const MY_PROJECTS = gql`
    query GetProjects($pagination: PaginationArg, $sort: [String], $userId: ID!) {
        projects(pagination: $pagination, sort: $sort, filters: { users_permissions_users: { documentId: { eq: $userId } } }) {
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
        }
    }
`;

export const MY_PROJECTS_EXTENDED = gql`
    query GetMyProjectsExtended($pagination: PaginationArg, $sort: [String], $filters: ProjectFiltersInput, $userId: ID!) {
        projects(pagination: $pagination, sort: $sort, filters: { 
            and: [
                { users_permissions_users: { documentId: { eq: $userId } } },
                $filters
            ]
        }) {
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
      createdAt
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
      createdAt
      durationStart
      durationEnd
      isJournalDatabase
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
            fundName
            documentId
            contentDesc
            fundType
            fundTypeText
            duration
            pages
            updatedAt
            createdAt
            partners
        }
    }
`;

export const MY_BOOKS = gql`
  query GetBooks($pagination: PaginationArg, $sort: [String], $userId: ID!) {
    books(
      pagination: $pagination
      sort: $sort
      filters: { funds: { users_permissions_users: { documentId: { eq: $userId } } } }
    ) {
      documentId
      bookType
      titleTH
      titleEN
      publicationDate
      updatedAt
      createdAt
      writers
      level
      attachments {
        documentId
        name
        url
        size
        mime
      }
      funds {
        publishedAt
      }
    }
  }
`;
