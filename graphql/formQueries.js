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
      createdAt
      projects {
        documentId
        nameTH
        nameEN
        partners
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
      createdAt
      durationStart
      durationEnd
      isJournalDatabase
      projects {
        documentId
        nameTH
        nameEN
        partners
      }
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks($pagination: PaginationArg, $sort: [String], $filters: BookFiltersInput) {
    books(pagination: $pagination, sort: $sort, filters: $filters) {
      documentId
      bookType
      titleTH
      titleEN
      publicationDate
      updatedAt
      createdAt
      writers
      level
      funds {
        writers
        documentId
        partners
        publishedAt
      }
      attachments {
        documentId
        name
        url
        size
        mime
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
      createdAt
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
      createdAt
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

// Fund operations
export const GET_FUNDS = gql`
  query GetFunds($pagination: PaginationArg, $sort: [String], $filters: FundFiltersInput) {
    funds(pagination: $pagination, sort: $sort, filters: $filters) {
      fundName
      documentId
      contentDesc
      fundType
      fundTypeText
      duration
      period
      pages
      updatedAt
      createdAt
      partners
    }
  }
`;

export const GET_MY_FUNDS = gql`
  query GetMyFunds($pagination: PaginationArg, $sort: [String], $userId: ID!, $filters: FundFiltersInput) {
    funds(pagination: $pagination, sort: $sort, filters: { 
      and: [
        { users_permissions_users: { documentId: { eq: $userId } } },
        $filters
      ]
    }) {
      fundName
      documentId
      contentDesc
      fundType
      fundTypeText
      duration
      period
      pages
      updatedAt
      createdAt
      partners
    }
  }
`;

export const GET_FUND = gql`
  query GetFund($documentId: ID!) {
    fund(documentId: $documentId) {
      fundName
      documentId
      writers
      fundType
      fundTypeText
      contentDesc
      pastPublications
      purpose
      targetGroup
      chapterDetails
      pages
      duration
      period
      references
      references2
      references3
      references4
      partners
      createdAt
      attachments { documentId name url size mime }
      users_permissions_users { documentId username email }
    }
  }
`;

export const CREATE_FUND = gql`
  mutation CreateFund($data: FundInput!) {
    createFund(data: $data) {
      documentId
      fundType
      fundTypeText
    }
  }
`;

export const UPDATE_FUND = gql`
  mutation UpdateFund($documentId: ID!, $data: FundInput!) {
    updateFund(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;

export const UPDATE_FUND_PARTNERS = gql`
  mutation UpdateFundPartners($documentId: ID!, $data: FundInput!) {
    updateFund(documentId: $documentId, data: $data) {
      documentId
      partners
    }
  }
`;

// Book (Work Book) operations
export const GET_BOOK = gql`
  query GetBook($documentId: ID!) {
    book(documentId: $documentId) {
      documentId
      bookType
      titleTH
      titleEN
      detail
      level
      publicationDate
      attachments { documentId name url size mime }
      writers
      revision
      bookStatus
      isbn
      publisher
      yearContracted
      refereed
      researchType
      numberPages
      createdAt
      funds { documentId fundName contentDesc fundType fundTypeText partners }
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook($data: BookInput!) {
    createBook(data: $data) {
      documentId
      bookType
      titleTH
      titleEN
      detail
      level
      publicationDate
      attachments { documentId name url size mime }
      writers
      funds { documentId fundType fundTypeText }
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($documentId: ID!, $data: BookInput!) {
    updateBook(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;