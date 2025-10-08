import { gql } from '@apollo/client';

export const GET_IMPACTS = gql`
    query Impacts {
        impacts {
            name
            documentId
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
                }
                users_permissions_users {
                    departments {
                        documentId
                    }
                }      
            }
            documentId
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