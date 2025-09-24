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