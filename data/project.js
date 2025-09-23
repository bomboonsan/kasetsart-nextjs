export const PROJECT_FORM_INITIAL = {
    fiscalYear: "2568", // ปีงบประมาณ (Int)
    projectType: "", // ประเภทโครงการ (Int)
    projectMode: "", // ลักษณะโครงการวิจัย (Int)
    subProjectCount: "", // จำนวนโครงการย่อย (Int)
    nameTH: "", // ชื่อโครงการ (ภาษาไทย) (String) - fixed field name
    nameEN: "", // ชื่อโครงการ (ภาษาอังกฤษ) (String)

    isEnvironmentallySustainable: "", // เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน (Int) 0=เกี่ยวข้อง, 1=ไม่เกี่ยวข้อง
    durationStart: "2025-08-01", // ระยะเวลาการทำวิจัย (Date)
    durationEnd: "2027-12-31", // ระยะเวลาการทำวิจัย (Date)

    researchKind: "", // ประเภทงานวิจัย (String) Value จาก select
    fundType: "", // ประเภทแหล่งทุน (String) Value จาก select
    fundSubType: "", // ประเภทแหล่งทุน (String) Value จาก select
    fundName: "", // ชื่อแหล่งทุน (String)
    budget: "", // งบวิจัย (Int)
    keywords: "", // คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร) (String)
    icTypes: "", // IC Types // Relationship (Int)
    impact: "", // Impact // Relationship (Int)
    sdg: "", // SDG // Relationship (Int)

    // ProjectPartner-like fields for the team section
    isInternal: "", // ProjectPartner.isInternal (Boolean)
    fullname: "", // ProjectPartner.fullname (String) - legacy
    partnerFullName: "", // ใช้ร่วมกับ ResearchTeamTable ให้เติมจาก UserPicker อัตโนมัติ
    orgName: "", // ProjectPartner.orgName (String)
    partnerType: "", // ProjectPartner.partnerType (String)
    partnerComment: "", // ProjectPartner.partnerComment (String)
    partnerProportion: "", // ProjectPartner.partnerProportion (Int)
    attachments: [],
}


export const researchKindOptions = [
    {
        value: "1",
        label: "การวิจัยพื้นฐานหรือการวิจัยบริสุทธิ์",
    },
    { value: "2", label: "การวิจัยประยุกต์" },
    { value: "3", label: "การวิจัยเชิงปฏิบัติ" },
    { value: "4", label: "การวิจัยและพัฒนา" },
    { value: "5", label: "การพัฒนาทดลอง" },
    {
        value: "6",
        label: "พื้นฐาน (basic Research)",
    },
    {
        value: "7",
        label: "พัฒนาและประยุกต์ (Development)",
    },
    {
        value: "8",
        label: "วิจัยเชิงปฏิบัติการ (Operational Research)",
    },
    {
        value: "9",
        label: "วิจัยทางคลินิก (Clinical Trial)",
    },
    {
        value: "10",
        label: "วิจัยต่อยอด (Translational research)",
    },
    {
        value: "11",
        label: "การขยายผลงานวิจัย (Implementation)",
    },
]

export const fundTypeOptions = [
    {
        value: "10",
        label:
            "เงินอุดหนุนรัฐบาลและเงินอุดหนุนอื่นที่รัฐบาลจัดสรรให้",
    },
    { value: "11", label: "เงินรายได้มหาวิทยาลัยและส่วนงาน" },
    { value: "12", label: "แหล่งทุนภายนอกมหาวิทยาลัย" },
    { value: "13", label: "เงินทุนส่วนตัว" },
]

export const subFundType1 = [
    { value: "19", label: "องค์กรรัฐ" },
    { value: "20", label: "องค์กรอิสระและเอกชน" },
    { value: "21", label: "แหล่งทุนต่างประเทศ" },
    { value: "23", label: "รัฐวิสาหกิจ" },
];
export const subFundType2 = [
    { value: "17", label: "เงินรายได้มหาวิทยาลัย" },
    { value: "18", label: "เงินรายได้ส่วนงาน" },
];
export const subFundType3 = [
    { value: "22", label: "เงินทุนส่วนตัว" },
];
export const subFundType4 = [
    {
        value: "14",
        label: "เงินอุดหนุนรัฐบาลและเงินอุดหนุนอื่นที่รัฐบาลจัดสรรให้",
    },
    { value: "15", label: "เงินงบประมาณมหาวิทยาลัย" },
];

export const fundNameOptions = [
    {
        value: "สำนักงานคณะกรรมการวิจัยแห่งชาติ",
        label: "สำนักงานคณะกรรมการวิจัยแห่งชาติ",
    },
    {
        value: "สำนักงานกองทุนสนับสนุนการวิจัย",
        label: "สำนักงานกองทุนสนับสนุนการวิจัย",
    },
    {
        value: "สำนักงานคณะกรรมการการอุดมศึกษา",
        label: "สำนักงานคณะกรรมการการอุดมศึกษา",
    },
    {
        value: "สำนักงานพัฒนาการวิจัยการเกษตร (สวก.)",
        label: "สำนักงานพัฒนาการวิจัยการเกษตร (สวก.)",
    },
    {
        value: "สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
        label: "สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
    },
    {
        value:
            "ศูนย์เทคโนโลยีโลหะและวัสดุแห่งชาติ สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
        label:
            "ศูนย์เทคโนโลยีโลหะและวัสดุแห่งชาติ สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
    },
    {
        value:
            "ศูนย์พันธุวิศวกรรมและเทคโนโลยีชีวภาพแห่งชาติ สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
        label:
            "ศูนย์พันธุวิศวกรรมและเทคโนโลยีชีวภาพแห่งชาติ สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ",
    },
    {
        value: "ศูนย์นาโนเทคโนโลยีแห่งชาติ",
        label: "ศูนย์นาโนเทคโนโลยีแห่งชาติ",
    },
    {
        value: "กระทรวงวิทยาศาสตร์และเทคโนโลยี",
        label: "กระทรวงวิทยาศาสตร์และเทคโนโลยี",
    },
    {
        value: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
        label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
    },
    { value: "มูลนิธิชัยพัฒนา", label: "มูลนิธิชัยพัฒนา" },
    { value: "มูลนิธิโครงการหลวง", label: "มูลนิธิโครงการหลวง" },
    {
        value: "มูลนิธิเพื่อการส่งเสริมวิทยาศาสตร์ ประเทศไทย",
        label: "มูลนิธิเพื่อการส่งเสริมวิทยาศาสตร์ ประเทศไทย",
    },
    {
        value: "กองทุนสิ่งแวดล้อม สำนักงานนโยบายและแผนสิ่งแวดล้อม",
        label: "กองทุนสิ่งแวดล้อม สำนักงานนโยบายและแผนสิ่งแวดล้อม",
    },
    {
        value:
            "กองทุนสนับสนุนการวิจัย ร่วมกับสำนักงานคณะกรรมการการอุดมศึกษา",
        label:
            "กองทุนสนับสนุนการวิจัย ร่วมกับสำนักงานคณะกรรมการการอุดมศึกษา",
    },
    {
        value:
            "ทุนอุดหนุนวิจัยภายใต้โครงการความร่วมมือระหว่างไทย-ญี่ปุ่น (NRCT-JSPS)",
        label:
            "ทุนอุดหนุนวิจัยภายใต้โครงการความร่วมมือระหว่างไทย-ญี่ปุ่น (NRCT-JSPS)",
    },
    { value: "อื่นๆ", label: "อื่นๆ" },
]