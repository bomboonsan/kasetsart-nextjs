export const PUBLICATION_FORM_INITIAL = {
    projects: [], // relation to project-research (documentId expected by Strapi v5)
    __projectObj: undefined, // สำหรับเก็บ object โครงการวิจัยที่เลือก
    titleTH: "", // ชื่อผลงาน (ไทย)
    titleEN: "", // ชื่อผลงาน (อังกฤษ)
    isEnvironmentallySustainable: 0, // เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน (Int) 0=เกี่ยวข้อง, 1=ไม่เกี่ยวข้อง
    journalName: "", // ชื่อการประชุมทางวิชาการ (ใช้ชื่อไทยถ้าไม่มีชื่อไทยให้ใช้ภาษาอื่น)
    doi: "", // DOI (ถ้าไม่มีให้ใส่ “-”) ความหมายของ DOI
    isbn: "", // ISBN (ป้อนอักษร 10 ตัว หรือ 13 ตัว ไม่ต้องใส่ “-”)
    volume: "", // ปีที่ (Volume) (Int)
    issue: "", // ฉบับที่ (Issue) (Int)
    durationStart: "", // วัน/เดือน/ปี ที่ตีพิมพ์  (Date)
    durationEnd: "", // วัน/เดือน/ปี ที่ตีพิมพ์  (Date)
    pageStart: "", // หน้าเริ่มต้น (Int)
    pageEnd: "", // หน้าสิ้นสุด (Int)
    level: "", // ระดับ 0=ระดับชาติ, 1=ระดับนานาชาติ
    isJournalDatabase: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูลหรือไม่
    isScopus: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล Scopus หรือไม่
    scopusType: "", // Scopus (ถ้าเลือก) (Int) Value จาก select
    scopusValue: "", // Scopus (ถ้าเลือก) (Int) Value จาก select
    isACI: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล ACI หรือไม่
    isABDC: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล ABDC หรือไม่
    abdcType: "", // ABDC (ถ้าเลือก) (Int) Value จาก select
    isTCI1: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล TCI1 หรือไม่
    isTCI2: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล TCI2 หรือไม่
    isAJG: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล isAJG หรือไม่
    ajgType: "", // AJG (ถ้าเลือก) (Int) Value จาก select
    isSSRN: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล Social Science Research Network หรือไม่
    isWOS: "", // วารสารที่เผยแพร่ผลงานวิจัยอยู่ในฐานข้อมูล Web of Science หรือไม่
    wosType: "", // Web of Science (ถ้าเลือก) (Int) Value จาก select
    fundName: "", // ชื่อแหล่งทุน (ถ้ามี)
    keywords: "", // คำสำคัญ (ถ้ามี) คั่นด้วย ,
    abstractTH: "", // บทคัดย่อ (ไทย)
    abstractEN: "", // บทคัดย่อ (อังกฤษ)
    attachments: [],
}


export const listsStandard = [
    {
        "label": "Scopus",
        "key": "isScopus",
    },
    {
        "label": "ACI",
        "key": "isACI",
    },
    {
        "label": "TCI1",
        "key": "isTCI1",
    },
    {
        "label": "ABDC",
        "key": "isABDC",
    },
    {
        "label": "TCI2",
        "key": "isTCI2",
    },
    {
        "label": "AJG",
        "key": "isAJG",
    },
    {
        "label": "Social Science Research Network",
        "key": "isSSRN",
    },
    {
        "label": "Web of Science",
        "key": "isWOS",
    },
]

export const listsStandardScopus = [
    {
        "label": "Q1",
        "value": 1
    },
    {
        "label": "Q2",
        "value": 2
    },
    {
        "label": "Q3",
        "value": 3
    },
    {
        "label": "Q4",
        "value": 4
    },
    {
        "label": "Delisted from Scopus",
        "value": 5
    }
]

export const listsStandardScopusSubset = [
    {
        "label": "Accounting",
        "value": 1
    },
    {
        "label": "Analysis",
        "value": 2
    },
    {
        "label": "Applied Mathematics",
        "value": 3
    },
    {
        "label": "Artificial Intelligence",
        "value": 4
    },
    {
        "label": "Business and International Management",
        "value": 5
    },
    {
        "label": "Business, Management and Accounting (miscellaneous)",
        "value": 6
    },
    {
        "label": "Computational Mathematics",
        "value": 7
    },
    {
        "label": "Computational Theory and Mathematics",
        "value": 8
    },
    {
        "label": "Computer Graphics and Computer-Aided Design",
        "value": 9
    },
    {
        "label": "Computer Networks and Communications",
        "value": 10
    },
    {
        "label": "Computer Science (miscellaneous)",
        "value": 11
    },
    {
        "label": "Computer Science Application",
        "value": 12
    },
    {
        "label": "Computer Vision and Pattern Recognition",
        "value": 13
    },
    {
        "label": "Control and Optimisation",
        "value": 14
    },
    {
        "label": "Control and Systems Engineering",
        "value": 15
    },
    {
        "label": "Decision Science (miscellaneous)",
        "value": 16
    },
    {
        "label": "Discrete Mathematics and Combinatorics",
        "value": 17
    },
    {
        "label": "Economics and Econometrics",
        "value": 18
    },
    {
        "label": "Economics, Econometrics and Finance (miscellaneous)",
        "value": 19
    },
    {
        "label": "Education",
        "value": 20
    },
    {
        "label": "Finance",
        "value": 21
    },
    {
        "label": "General Business, Management and Accounting",
        "value": 22
    },
    {
        "label": "General Computer Sciences",
        "value": 23
    },
    {
        "label": "General Decision Sciences",
        "value": 24
    },
    {
        "label": "General Economics, Econometrics and Finance",
        "value": 25
    },
    {
        "label": "General Engineering",
        "value": 26
    },
    {
        "label": "General Mathematics",
        "value": 27
    },
    {
        "label": "General Social Sciences",
        "value": 28
    },
    {
        "label": "Hardware and Architecture",
        "value": 29
    },
    {
        "label": "Human-Computer Interaction",
        "value": 30
    },
    {
        "label": "Industrial and Manufacturing Engineering",
        "value": 31
    },
    {
        "label": "Industrial Relations",
        "value": 32
    },
    {
        "label": "Information Systems",
        "value": 33
    },
    {
        "label": "Information Systems and Management",
        "value": 34
    },
    {
        "label": "Issues, Ethics and Legal Aspects",
        "value": 35
    },
    {
        "label": "Leadership and Management",
        "value": 36
    },
    {
        "label": "Library and Information Sciences",
        "value": 37
    },
    {
        "label": "Logic",
        "value": 38
    },
    {
        "label": "Management Information Systems",
        "value": 39
    },
    {
        "label": "Management of Technology and Innovation",
        "value": 40
    },
    {
        "label": "Management Science and Operations Research",
        "value": 41
    },
    {
        "label": "Management, Monitoring, Policy and Law",
        "value": 42
    },
    {
        "label": "Marketing",
        "value": 43
    },
    {
        "label": "Mathematics (miscellaneous)",
        "value": 44
    },
    {
        "label": "Media Technology",
        "value": 45
    },
    {
        "label": "Modelling and Simulation",
        "value": 46
    },
    {
        "label": "Multidisciplinary",
        "value": 47
    },
    {
        "label": "Numerical Analysis",
        "value": 48
    },
    {
        "label": "Organisational Behaviour and Human Resource Management",
        "value": 49
    },
    {
        "label": "Public Administration",
        "value": 50
    },
    {
        "label": "Renewable Energy, Sustainability and the Environment",
        "value": 51
    },
    {
        "label": "Research and Theory",
        "value": 52
    },
    {
        "label": "Review and Exam Preparation",
        "value": 53
    },
    {
        "label": "Safety, Risk, Reliability and Quality",
        "value": 54
    },
    {
        "label": "Sensory Systems",
        "value": 55
    },
    {
        "label": "Signal Processing",
        "value": 56
    },
    {
        "label": "Social Psychology",
        "value": 57
    },
    {
        "label": "Social Sciences (miscellaneous)",
        "value": 58
    },
    {
        "label": "Sociology and Political Sciences",
        "value": 59
    },
    {
        "label": "Software",
        "value": 60
    },
    {
        "label": "Statistics and Probability",
        "value": 61
    },
    {
        "label": "Statistics, Probability and Uncertainty",
        "value": 62
    },
    {
        "label": "Strategy and Management",
        "value": 63
    },
    {
        "label": "Stratigraphy",
        "value": 64
    },
    {
        "label": "Theoretical Computer Science",
        "value": 65
    },
    {
        "label": "Tourism, Leisure and Hospitality Management",
        "value": 66
    },
    {
        "label": "Transportation",
        "value": 67
    },
    {
        "label": "Urban Studies",
        "value": 68
    }
]

export const listsStandardWebOfScience = [
    {
        "label": "SCIE",
        "value": 1
    },
    {
        "label": "SSCI",
        "value": 2
    },
    {
        "label": "AHCI",
        "value": 3
    },
    {
        "label": "ESCI",
        "value": 4
    },
]

export const listsStandardABDC = [
    {
        "label": "A*",
        "value": 1
    },
    {
        "label": "A",
        "value": 2
    },
    {
        "label": "B",
        "value": 3
    },
    {
        "label": "C",
        "value": 4
    },
    {
        "label": "Other",
        "value": 5
    },
]

export const listsStandardAJG = [
    {
        "label": "ระดับ 4*",
        "value": 1
    },
    {
        "label": "ระดับ 4",
        "value": 2
    },
    {
        "label": "ระดับ 3",
        "value": 3
    },
    {
        "label": "ระดับ 2",
        "value": 4
    },
    {
        "label": "ระดับอื่น",
        "value": 5
    },
]