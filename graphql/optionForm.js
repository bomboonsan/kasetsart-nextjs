import { gql } from '@apollo/client';

export const GET_PROJECT_OPTIONS = gql`
query ProjectOptions {
    icTypes {
        documentId
        name
    }
    impacts {
        documentId
        name
    }
    sdgs(pagination: { limit: 20 }) {
        documentId
        name
    }
    departments {
        documentId
        title
    }
}
`;

export const GET_USERS_FILTER_OPTIONS = gql`
query UsersFilterOptions {
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