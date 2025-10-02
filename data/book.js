export const BOOK_FORM_INITIAL = {
    funds: [], // relation to funding (documentId)
    bookType: "", // ประเภทผลงาน (0=หนังสือ,1=ตำรา)
    titleTH: "", // ชื่อผลงาน (ไทย)
    titleEN: "", // ชื่อผลงาน (อังกฤษ)
    detail: "", // รายละเอียดเบื้องต้นของหนังสือ หรือ ตำรา
    level: "", // ระดับ 0=ระดับชาติ, 1=ระดับนานาชาติ
    publicationDate: "", // วันที่เกิดผลงาน (Date)
    attachments: [],
    writers: [], // Writers array for dynamic management
    partners: [], // ผู้ร่วมงาน/ผู้ร่วมจัดทำ (Array similar to conference partners structure)
    __fundingObj: undefined, // สำหรับเก็บ object โครงการขอทุนที่เลือก
    revision: "",
    bookStatus: "",
    isbn: "", // ISBN
    publisher: "",
    yearContracted: "",
    refereed: "",
    numberPages: "",
}
