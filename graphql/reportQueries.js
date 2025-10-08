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
            documentId
            participation
            departments { documentId }
        }
        departments { documentId title }
        publications {
            documentId
            projects {
                documentId
                departments { documentId }
                partners
                ic_types { documentId }
            }
        }
        conferences {
            documentId
            projects {
                documentId
                departments { documentId }
                partners
            }
        }
        books {
            documentId
            funds {
                documentId
                partners
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

export const GET_REPORT_C = gql`
    query ReportC {
  
    usersPermissionsUsers {
        departments {
        documentId
        }
        participation
    }
    
    publications {
        
        projects {      
        partners
        
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
    }
    departments {
        documentId
        title
    }
    }
`;

export const GET_REPORT_D = gql`
    query ReportC {
  
    usersPermissionsUsers {
        departments {
        documentId
        }
        participation
    }
    
    publications {
        
        projects {      
        partners
        
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
    }
    departments {
        documentId
        title
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