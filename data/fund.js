export const FUND_FORM_INITIAL = {
    writers: [], // json array of { fullName, department, faculty , phone, email }
    fundType: "", // ลักษณะของผลงานวิชาการที่จะขอรับทุน (Int) 0=ตำรา ใช้สอนในรายวิชา, 1=หนังสือ(ชื่อไทย และชื่อภาษาอังกฤษ)
    fundTypeText: "", // ข้อความจาก radio button ลักษณะของผลงานวิชาการที่จะขอรับทุน
    contentDesc: "", // คำอธิบายเนื้อหาของตำราหรือหนังสือ
    pastPublications: "", // เอกสารทางวิชาการ ตำรา หรือ หนังสือ
    purpose: "", // วัตถุประสงค์ของตำราหรือหนังสือ (schema: purpose)
    targetGroup: "", // กลุ่มเป้าหมายของตำราหรือหนังสือ (schema: targetGroup)
    chapterDetails: "", // การแบ่งบทและรายละเอียดในแต่ละบทของตำรา/หนังสือ
    pages: "", // ตำรา หรือ หนังสือ มีจำนวนประมาณ (Int)
    duration: "", // ระยะเวลา (ปี หรือ เดือน) ที่จะใช้ในการเขียนประมาณ (Date)
    period: "", // ปีงบประมาณที่ขอรับทุน (str)
    references: "", // รายชื่อหนังสือและเอกสารอ้างอิง (บรรณานุกรม)
    partners: [], // json array
    attachments: [],
}