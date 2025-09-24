import { gql } from '@apollo/client';

export const GET_DASHBOARD = gql`
query Dashboard {
    projects {
        documentId

        departments {
            documentId
        }
        ic_types {
            documentId
        }
        sdgs {
            documentId
        }
        impacts {
            documentId
        }
    }
    funds {
        documentId
    }
    conferences {
        documentId
    }
    publications {
        documentId
    }  
    books {
        documentId
    }
    usersPermissionsUsers {
        academic_types {
        name
        documentId
        }
    }
    icTypes {
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
    departments {
        documentId
        title
    }
}
`;


// Sample response
// {
//     "data": {
//         "projects": [
//             {
//                 "documentId": "yck91zxcml4hjvfyovh52hgb",
//                 "departments": [],
//                 "ic_types": [
//                     {
//                         "documentId": "ajvjbvrlfv7vz5owyr3qrdsn"
//                     }
//                 ],
//                 "sdgs": [
//                     {
//                         "documentId": "l5cj2hfp5o3b2u7h74w8vbgx"
//                     }
//                 ],
//                 "impacts": [
//                     {
//                         "documentId": "d6ffaiiqsghhzb6cir9nm7um"
//                     }
//                 ]
//             },
//             {
//                 "documentId": "dre8mo593bziyu6a7v9qyu0h",
//                 "departments": [],
//                 "ic_types": [
//                     {
//                         "documentId": "fdjpi1aog5lx9gvjxlnf47ym"
//                     }
//                 ],
//                 "sdgs": [
//                     {
//                         "documentId": "doi80k4853ixaohvxwelhga8"
//                     }
//                 ],
//                 "impacts": [
//                     {
//                         "documentId": "d6ffaiiqsghhzb6cir9nm7um"
//                     }
//                 ]
//             },
//             {
//                 "documentId": "enyuhdx5w9qdkmrf89416m02",
//                 "departments": [],
//                 "ic_types": [
//                     {
//                         "documentId": "ajvjbvrlfv7vz5owyr3qrdsn"
//                     }
//                 ],
//                 "sdgs": [
//                     {
//                         "documentId": "nmwxw8vvy5mbgeo13z092bkf"
//                     }
//                 ],
//                 "impacts": [
//                     {
//                         "documentId": "d6ffaiiqsghhzb6cir9nm7um"
//                     }
//                 ]
//             },
//             {
//                 "documentId": "jgwsx3l8guhw9xt6dx6tl0z1",
//                 "departments": [],
//                 "ic_types": [
//                     {
//                         "documentId": "ajvjbvrlfv7vz5owyr3qrdsn"
//                     }
//                 ],
//                 "sdgs": [
//                     {
//                         "documentId": "lqi6pmsclvuprioao91zrh0w"
//                     }
//                 ],
//                 "impacts": [
//                     {
//                         "documentId": "xeuhvpciv7stvysq70yl9k6z"
//                     }
//                 ]
//             },
//             {
//                 "documentId": "zo790r8rbjgsreas74wyb9wh",
//                 "departments": [
//                     {
//                         "documentId": "vath4242pg08hkqol782yggv"
//                     }
//                 ],
//                 "ic_types": [
//                     {
//                         "documentId": "bnl6a37iee0vec6aj3q3qm31"
//                     }
//                 ],
//                 "sdgs": [
//                     {
//                         "documentId": "rvhjmuobvr5az7oubbfhf0yw"
//                     }
//                 ],
//                 "impacts": [
//                     {
//                         "documentId": "ccuvur1gtltvalcc9lvkc4q2"
//                     }
//                 ]
//             }
//         ],
//             "funds": [
//                 {
//                     "documentId": "k6tkmbhp6h7ssm3g3qpgq5co"
//                 },
//                 {
//                     "documentId": "t5zyawgu2r5fqda45hxcxavc"
//                 }
//             ],
//                 "conferences": [
//                     {
//                         "documentId": "p7z6bau7js7xwxdw2fqg524a"
//                     },
//                     {
//                         "documentId": "ikbvgv85myl95podyzygrxe4"
//                     }
//                 ],
//                     "publications": [
//                         {
//                             "documentId": "rrbhzgt5hrd1puivzfvcl9j6"
//                         },
//                         {
//                             "documentId": "i3ix46eamycp8ifumoxwnt4d"
//                         },
//                         {
//                             "documentId": "ybilmcqo4lamw7clpeob972q"
//                         }
//                     ],
//                         "books": [],
//                             "usersPermissionsUsers": [
//                                 {
//                                     "academic_types": [
//                                         {
//                                             "name": "A",
//                                             "documentId": "ccy8ydo8i2ckpqjaerod07cv"
//                                         }
//                                     ]
//                                 },
//                                 {
//                                     "academic_types": [
//                                         {
//                                             "name": "A",
//                                             "documentId": "ccy8ydo8i2ckpqjaerod07cv"
//                                         }
//                                     ]
//                                 },
//                                 {
//                                     "academic_types": [
//                                         {
//                                             "name": "PA",
//                                             "documentId": "te7v55n8xlfxbli0j0lkinb3"
//                                         }
//                                     ]
//                                 },
//                                 {
//                                     "academic_types": []
//                                 },
//                                 {
//                                     "academic_types": [
//                                         {
//                                             "name": "PA",
//                                             "documentId": "te7v55n8xlfxbli0j0lkinb3"
//                                         }
//                                     ]
//                                 }
//                             ],
//                                 "icTypes": [
//                                     {
//                                         "documentId": "fdjpi1aog5lx9gvjxlnf47ym",
//                                         "name": "Basic or Discovery Scholarship"
//                                     },
//                                     {
//                                         "documentId": "ajvjbvrlfv7vz5owyr3qrdsn",
//                                         "name": "Applied or Integrative / Application Scholarship"
//                                     },
//                                     {
//                                         "documentId": "bnl6a37iee0vec6aj3q3qm31",
//                                         "name": "Teaching and Learning Scholarship"
//                                     }
//                                 ],
//                                     "impacts": [
//                                         {
//                                             "documentId": "ccuvur1gtltvalcc9lvkc4q2",
//                                             "name": "Teaching & Learning Impact"
//                                         },
//                                         {
//                                             "documentId": "d6ffaiiqsghhzb6cir9nm7um",
//                                             "name": "Research & Scholarly Impact"
//                                         },
//                                         {
//                                             "documentId": "xeuhvpciv7stvysq70yl9k6z",
//                                             "name": "Practice & Community Impact"
//                                         },
//                                         {
//                                             "documentId": "kq6ol8bm18pucphvxfk0sxt7",
//                                             "name": "Societal Impact"
//                                         }
//                                     ],
//                                         "sdgs": [
//                                             {
//                                                 "documentId": "k95jcz87rg69pt78k56te2vs",
//                                                 "name": "SDG 1 - No Poverty"
//                                             },
//                                             {
//                                                 "documentId": "lqi6pmsclvuprioao91zrh0w",
//                                                 "name": "SDG 2 - Zero Hunger"
//                                             },
//                                             {
//                                                 "documentId": "no0dn6sr7e3skr16f5we5b78",
//                                                 "name": "SDG 3 - Good Health and Well-Being"
//                                             },
//                                             {
//                                                 "documentId": "nmwxw8vvy5mbgeo13z092bkf",
//                                                 "name": "SDG 4 - Quality Education"
//                                             },
//                                             {
//                                                 "documentId": "v34lq54tw9qgx7vmgz9qfaq5",
//                                                 "name": "SDG 5 - Gender Equality"
//                                             },
//                                             {
//                                                 "documentId": "xuzpgmiaab4294fadavxm2kr",
//                                                 "name": "SDG 6 - Clean Water and Sanitation"
//                                             },
//                                             {
//                                                 "documentId": "vh6vb485xor71g3kx0jt3ls4",
//                                                 "name": "SDG 7 - Affordable and Clean Energy"
//                                             },
//                                             {
//                                                 "documentId": "hk294jbkgj6nnwvywvcgc8dt",
//                                                 "name": "SDG 8 - Decent Work and Economic Growth"
//                                             },
//                                             {
//                                                 "documentId": "tb8q748e7zjuufw5pdcypy21",
//                                                 "name": "SDG 9 - Industry, Innovation and Infrastructure"
//                                             },
//                                             {
//                                                 "documentId": "v2y2y13033rphbqhgzxygy4k",
//                                                 "name": "SDG 10 - Reduced Inequalities"
//                                             }
//                                         ],
//                                             "departments": [
//                                                 {
//                                                     "documentId": "tukk64ynbxczeyobssthue1w",
//                                                     "title": "Accounting"
//                                                 },
//                                                 {
//                                                     "documentId": "yjb6706tqfrbabpb6p9hu6qe",
//                                                     "title": "Finance"
//                                                 },
//                                                 {
//                                                     "documentId": "f43p0cgx1s1zjx7jweorl4i4",
//                                                     "title": "Management"
//                                                 },
//                                                 {
//                                                     "documentId": "vath4242pg08hkqol782yggv",
//                                                     "title": "Marketing"
//                                                 },
//                                                 {
//                                                     "documentId": "a1cljtpsitsmrxi00zqwllth",
//                                                     "title": "สํานักงานเลขานุการ"
//                                                 }
//                                             ]
//     }
// }