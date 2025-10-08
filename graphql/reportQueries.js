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
    query ReportA {  
        usersPermissionsUsers {
            departments {
                documentId
            }
            participation
        }
        books {
            funds {
                partners
            }
        }
        conferences {
            projects {
                partners
            }
        }
        publications {

            projects {
            
                partners
                ic_types {
                    documentId
                }
            }
        }
        departments {
            documentId
            title
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