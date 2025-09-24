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
      departments {
        documentId
        title
      }
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
      attachments {
        id
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($documentId: ID!, $data: ProjectInput!) {
    updateProject(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;

export const UPDATE_PROJECT_PARTNERS = gql`
  mutation UpdateProjectPartners($documentId: ID!, $data: ProjectInput!) {
    updateProject(documentId: $documentId, data: $data) {
      documentId
      partners
    }
  }
`;

export const CREATE_CONFERENCE = gql`
  mutation CreateConference($data: ConferenceInput!) {
    createConference(data: $data) {
      documentId
      titleTH
      titleEN
      isEnvironmentallySustainable
      journalName
      doi
      isbn
      durationStart
      durationEnd
      cost
      costType
      presentationWork
      presentType
      articleType
      abstractTH
      abstractEN
      summary
      level
      country
      state
      city
      fundName
      keywords
      attachments {
        documentId
        name
        url
        size
        mime
      }
      projects {
        documentId
        nameTH
        nameEN
      }
    }
  }
`;