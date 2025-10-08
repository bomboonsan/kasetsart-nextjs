import { gql } from '@apollo/client';

export const GET_IMPACTS = gql`
    query Impacts {
        impacts {
            name
            documentId
        }
    }
`;

export const GET_REPORT_A = gql`
    query Publications {
        publications {
            documentId
            titleEN
            titleTH
            authors
            journalName
            journalIssn
            journalIsbn
            journalPublisher
            journalImpactFactor
            journalDatabase
            volume
            issue
            pages
            doi
            publicationYear
            level
            isJournalDatabase
            abstractEN
            abstractTH
            keywordsEN
            keywordsTH
            urlFulltext
            urlSupplementary
            urlDataRepository
            fundingSource
            fundingAmount
            fundingCurrency
            durationStart
            durationEnd
            projects {
                documentId
                titleEN
                titleTH
                users_permissions_users {
                    documentId
                    firstNameTH
                    lastNameTH
                    firstNameEN
                    lastNameEN
                    email
                    username
                    departments {
                        documentId
                        title
                    }
                }
                impacts {
                    documentId
                    name
                }
            }
        }
    }
`;

export const GET_REPORT_B = gql`
    query Publications {
        publications {
            projects {
                documentId
                impacts {
                    documentId
                    name
                }
                users_permissions_users {
                    departments {
                        documentId
                        title
                    }
                }
            }
            documentId
            durationStart
        }
    }
`;

export const GET_REPORT_E = gql`
    query Projects {
        projects {            
            partners
            publications {
                abstractEN
                abstractTH
                journalName
                isJournalDatabase
                volume
                level
                durationStart
            }
        }
    }
`;

export const GET_REPORT_F = gql`
    query Projects {
        projects {        
            partners
            conferences {
                abstractTH
                abstractEN
                journalName
                level
                durationStart
            }
        }
    }
`;