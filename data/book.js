export const BOOK_FORM_INITIAL = {
    funds: [], // relation to funding (documentId)
    bookType: 0, // ประเภทผลงาน (0=หนังสือ,1=ตำรา)
    titleTH: "", // ชื่อผลงาน (ไทย)
    titleEN: "", // ชื่อผลงาน (อังกฤษ)
    detail: "", // รายละเอียดเบื้องต้นของหนังสือ หรือ ตำรา
    level: "", // ระดับ 0=ระดับชาติ, 1=ระดับนานาชาติ
    publicationDate: "", // วันที่เกิดผลงาน (Date)
    attachments: [],
    writers: [], // Writers array for dynamic management
    __fundingObj: undefined, // สำหรับเก็บ object โครงการขอทุนที่เลือก
}
