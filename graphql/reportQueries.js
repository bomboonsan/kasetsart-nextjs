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
    query ReportA($pagination: PaginationArg) {  
        usersPermissionsUsers(pagination: $pagination) {
            documentId
            participation
            departments { documentId }
            academic_types {
                documentId
            }
            projects {
                documentId
            }
            funds {
                documentId
            }
        }
        departments { documentId title }
        publications(pagination: $pagination) {
            documentId
            
            projects {
                documentId
                departments { documentId }
                partners
                ic_types { documentId }
            }
            durationEnd
            durationStart
        }
        conferences(pagination: $pagination) {
            documentId
            projects {
                documentId
                departments { documentId }
                partners
                ic_types { documentId }
            }
            durationEnd
            durationStart
        }
        books(pagination: $pagination) {
            documentId
            funds {
                documentId
                partners
            }
            publishedAt
        }
    }
`;

export const GET_REPORT_B = gql`
    query Publications($pagination: PaginationArg) {
        publications(pagination: $pagination) {
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

export const GET_REPORT_C = gql`
    query ReportC($pagination: PaginationArg) {

    usersPermissionsUsers(pagination: $pagination) {
        departments {
            documentId
        }
        participation
    }
    publications(pagination: $pagination) {
        durationEnd
        durationStart
        projects {      
            partners
            departments { documentId }
        }
        level
        isJournalDatabase
        isEnvironmentallySustainable
        isAJG
        isACI
        isABDC
        ajgType
        abdcType
        isSSRN
        isScopus
        isTCI1
        isTCI2
        isWOS
        isbn
        issue
        wosType
        scopusType
        scopusValue
        documentId
    }
    departments {
        documentId
        title
    }
}
`;

export const GET_REPORT_D = gql`
    query ReportD($pagination: PaginationArg) {

    usersPermissionsUsers(pagination: $pagination) {
        departments {
            documentId
        }
        participation
    }
    publications(pagination: $pagination) {
        durationEnd
        durationStart
        projects {      
            partners
            departments { documentId }
        }
        level
        isJournalDatabase
        isEnvironmentallySustainable
        isAJG
        isACI
        isABDC
        ajgType
        abdcType
        isSSRN
        isScopus
        isTCI1
        isTCI2
        isWOS
        isbn
        issue
        wosType
        scopusType
        scopusValue
    }
    departments {
        documentId
        title
    }
}
`;

export const GET_REPORT_E = gql`
    query Projects($pagination: PaginationArg) {
        projects(pagination: $pagination) {            
            partners
            publications {
                abstractEN
                abstractTH
                journalName
                isJournalDatabase
                volume
                level
                durationStart
                durationEnd
            }
        }
        departments {
            documentId
            title
        }
    }
`;

export const GET_REPORT_F = gql`
    query Projects($pagination: PaginationArg) {
        projects(pagination: $pagination) {        
            partners
            conferences {
                abstractTH
                abstractEN
                journalName
                level
                durationStart
                durationEnd
            }
        }
        departments {
            documentId
            title
        }
    }
`;