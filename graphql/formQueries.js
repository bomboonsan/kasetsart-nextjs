import { gql } from "@apollo/client";

export const GET_CONFERENCES = gql`
  query GetConferences($pagination: PaginationArg, $sort: [String], $filters: ConferenceFiltersInput) {
    conferences(pagination: $pagination, sort: $sort, filters: $filters) {
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

export const GET_PUBLICATIONS = gql`
  query GetPublications($pagination: PaginationArg, $sort: [String], $filters: PublicationFiltersInput) {
    publications(pagination: $pagination, sort: $sort, filters: $filters) {
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

export const GET_CONFERENCE = gql`
  query GetConference($documentId: ID!) {
    conference(documentId: $documentId) {
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
        partners
      }
    }
  }
`;

export const UPDATE_CONFERENCE = gql`
  mutation UpdateConference($documentId: ID!, $data: ConferenceInput!) {
    updateConference(documentId: $documentId, data: $data) {
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
        partners
      }
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

// Publication operations
export const GET_PUBLICATION = gql`
  query GetPublication($documentId: ID!) {
    publication(documentId: $documentId) {
      documentId
      titleTH
      titleEN
      isEnvironmentallySustainable
      journalName
      doi
      isbn
      volume
      issue
      durationStart
      durationEnd
      pageStart
      pageEnd
      level
      isJournalDatabase
      isScopus
      scopusType
      scopusValue
      isACI
      isABDC
      abdcType
      isTCI1
      isTCI2
      isAJG
      ajgType
      isSSRN
      isWOS
      wosType
      fundName
      keywords
      abstractTH
      abstractEN
      attachments { documentId name url size mime }
      projects { documentId nameTH nameEN partners }
    }
  }
`;

export const CREATE_PUBLICATION = gql`
  mutation CreatePublication($data: PublicationInput!) {
    createPublication(data: $data) {
      documentId
      titleTH
      titleEN
      journalName
      doi
      isbn
      volume
      issue
      durationStart
      durationEnd
      pageStart
      pageEnd
      level
      fundName
      keywords
      attachments { documentId name url size mime }
      projects { documentId nameTH nameEN }
    }
  }
`;

export const UPDATE_PUBLICATION = gql`
  mutation UpdatePublication($documentId: ID!, $data: PublicationInput!) {
    updatePublication(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;