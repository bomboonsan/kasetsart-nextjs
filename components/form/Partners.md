# Partners Component Documentation

## Overview
คอมโพเนนต์ `Partners.jsx` ใช้สำหรับจัดการข้อมูลผู้ร่วมโครงการวิจัย สามารถเพิ่ม แก้ไข ลบ และจัดลำดับสมาชิกได้

## การใช้งาน

### Basic Usage
```jsx
import Partners from '@/components/form/Partners';

function MyForm() {
    const [partnersData, setPartnersData] = useState([]);

    const handlePartnersChange = (newData) => {
        setPartnersData(newData);
    };

    return (
        <Partners 
            data={partnersData} 
            onChange={handlePartnersChange} 
        />
    );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | Array | ✅ | อาร์เรย์ของข้อมูลสมาชิก |
| `onChange` | Function | ✅ | ฟังก์ชันที่จะถูกเรียกเมื่อข้อมูลเปลี่ยน |

### Data Structure

```javascript
const partnerData = {
    id: 1,                                        // ID ของสมาชิก
    order: 1,                                     // ลำดับ
    fullname: "ชื่อ-นามสกุล",                      // ชื่อเต็ม
    orgName: "ชื่อหน่วยงาน",                       // หน่วยงาน
    partnerType: "หัวหน้าโครงการ",                 // ประเภทผู้ร่วมโครงการ
    partnerComment: "First Author",               // หมายเหตุ
    partnerProportion_percentage_custom: "50",   // สัดส่วนเป็น %
    partnerProportion: 0.5,                      // สัดส่วนเป็นทศนิยม
    isInternal: true,                            // ภายใน/ภายนอก มก.
    userID: 123,                                 // ID ของผู้ใช้ (optional)
    User: { ... }                                // ข้อมูลผู้ใช้ (optional)
}
```

## ฟีเจอร์

### 1. เพิ่มสมาชิกใหม่
- คลิกปุ่ม "เพิ่มสมาชิก"
- เลือกประเภท (ภายใน/ภายนอก มก.)
- กรอกข้อมูลในฟอร์ม
- คลิก "เพิ่ม"

### 2. แก้ไขสมาชิก
- คลิกปุ่ม "แก้ไข" ในแถวที่ต้องการ
- แก้ไขข้อมูลในฟอร์ม
- คลิก "บันทึก"

### 3. ลบสมาชิก
- คลิกปุ่ม "ลบ" ในแถวที่ต้องการ

### 4. จัดลำดับสมาชิก
- ใช้ปุ่ม ↑ (ขึ้น) และ ↓ (ลง) เพื่อเปลี่ยนลำดับ

## ประเภทสมาชิก

- หัวหน้าโครงการ
- ที่ปรึกษาโครงการ
- ผู้ประสานงาน
- นักวิจัยร่วม
- อื่นๆ

## หมายเหตุพิเศษ

- First Author: จำกัดเพียง 1 คนในโครงการ
- Corresponding Author: จำกัดเพียง 1 คนในโครงการ

## Example

```jsx
const initialData = [
    {
        id: 1,
        order: 1,
        fullname: "สมชาย ใจดี",
        orgName: "คณะเกษตรศาสตร์ มหาวิทยาลัยเกษตรศาสตร์",
        partnerType: "หัวหน้าโครงการ",
        partnerComment: "First Author",
        partnerProportion_percentage_custom: "50",
        partnerProportion: 0.5,
        isInternal: true,
    }
];

function ProjectForm() {
    const [partners, setPartners] = useState(initialData);

    return (
        <div>
            <h2>ผู้ร่วมโครงการวิจัย</h2>
            <Partners 
                data={partners} 
                onChange={setPartners} 
            />
        </div>
    );
}
```