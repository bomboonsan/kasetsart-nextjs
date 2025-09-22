import { gql } from '@apollo/client';

export const GET_ACADEMIC_TYPES = gql`
  query GetAcademicTypes {
    academicTypes(pagination: { limit: -1 }) {
      data {
        attributes {
          name
          documentId
        }
      }
    }
  }
`;
