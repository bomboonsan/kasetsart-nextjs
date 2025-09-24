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
