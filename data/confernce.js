export const CONFERENCE_FORM_INITIAL = {
    project_research: [], // relation to project-research
    titleTH: "", // ชื่อผลงาน (ไทย)
    titleEN: "", // ชื่อผลงาน (อังกฤษ)
    isEnvironmentallySustainable: "", // เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน (Int) 0=เกี่ยวข้อง, 1=ไม่เกี่ยวข้อง
    journalName: "", // ชื่อการประชุมทางวิชาการ (ใช้ชื่อไทยถ้าไม่มีชื่อไทยให้ใช้ภาษาอื่น)
    doi: "", // DOI (ถ้าไม่มีให้ใส่ “-”) ความหมายของ DOI
    isbn: "", // ISBN (ป้อนอักษร 10 ตัว หรือ 13 ตัว ไม่ต้องใส่ “-”)
    durationStart: "2025-11-30",
    durationEnd: "2025-11-30",
    cost: "", // ค่าใช้จ่าย (Int)
    costType: "", // ค่าใช้จ่ายมาจาก  (Int) Value จาก select
    __projectObj: undefined, // สำหรับเก็บ object โครงการวิจัยที่เลือก
    presentationWork: "", // การนำเสนอผลงาน (Int) 0=ได้รับเชิญ (Invited Paper.), 1=เสนอเอง
    presentType: "", // ประเภทการนำเสนอ (Int) 0=ภาคบรรยาย (Oral), 1=ภาคโปสเตอร์ (Poster), 2=เข้าร่วมประชุมวิชาการ
    articleType: "", // ประเภทบทความ (Int) 0=Abstract อย่างเดียว, 1=เรื่องเต็ม
    abstractTH: "", // บทคัดย่อ (ไทย) (ไม่มีข้อมูลให้ใส่ “-”)
    abstractEN: "", // บทคัดย่อ (อังกฤษ) (ไม่มีข้อมูลให้ใส่ “-”)
    summary: "", // กรณีเข้าร่วมประชุมวิชาการ สรุปเนื้อหาการประชุมแบบย่อ(ถ้าไม่มีข้อมูลให้ใส่ -)
    keywords: "", // คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)
    level: "", // ระดับ 0=ระดับชาติ, 1=ระดับนานาชาติ
    country: "", // รหัสประเทศ   (str) Value จาก select
    state: "", // รัฐ/จังหวัด   (str) Value จาก select
    city: "", // เมือง   (str) Value จาก select
    fundName: "", // ชื่อแหล่งทุน (String)
    partners: [], // ผู้ร่วมวิจัย/ผู้ร่วมจัดทำผลงาน (Array of String)
    attachments: [],
}


export const COST_TYPE_OPTIONS = [
    { value: '1', label: 'เงินทุนส่วนตัว' },
    { value: '10', label: 'เงินอุดหนุนรัฐบาลและเงินอุดหนุนอื่นที่รัฐบาลจัดสรรให้' },
    { value: '11', label: 'เงินงบประมาณมหาวิทยาลัย' },
    { value: '12', label: 'เงินรายได้ส่วนกลาง มก.' },
    { value: '13', label: 'ทุนอุดหนุนวิจัย มก.' },
    { value: '14', label: 'เงินรายได้มหาวิทยาลัย' },
    { value: '15', label: 'เงินรายได้ส่วนงาน' },
    { value: '16', label: 'องค์กรรัฐ' },
    { value: '17', label: 'องค์กรอิสระและเอกชน' },
    { value: '18', label: 'แหล่งทุนต่างประเทศ' },
    { value: '20', label: 'รัฐวิสาหกิจ' },
];