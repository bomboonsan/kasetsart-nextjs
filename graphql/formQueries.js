import { gql } from "@apollo/client";

export const CREATE_PROJECT = gql`
  mutation CreateProject($data: ProjectInput!) {
    createProject(data: $data) {
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
      ic_types {
        documentId
        name
      }
      impacts {
        documentId
        name
      }
      sdgs {
        documentId
        name
      }
      partners
      
    }
  }
`;