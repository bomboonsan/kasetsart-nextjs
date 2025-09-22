import { useState, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// ฟังก์ชันสำหรับ fetch ข้อมูล academic types (รองรับรูปแบบ response ของ Strapi)
const fetchAcademicTypes = async (token) => {
    const res = await apiClient.get('/academic-types?populate=*', {
        headers: { Authorization: `Bearer ${token}` }
    });

    const payload = res.data;
    let items = [];

    // รองรับหลายรูปแบบที่ Strapi อาจคืนค่า (ตรงๆ หรือใน .data)
    if (Array.isArray(payload)) {
        items = payload;
    } else if (Array.isArray(payload.data)) {
        // Strapi v4: { data: [ { id, attributes: { ... } } ], meta: {} }
        items = payload.data;
    } else if (payload.data && Array.isArray(payload.data.data)) {
        // ถ้าถูกห่อชั้นเพิ่มเติม (defensive)
        items = payload.data.data;
    } else {
        items = [];
    }

    // normalize: ให้ผลลัพธ์เป็น { value, label }
    return items.map((it) => {
        const raw = it.attributes ? { ...it.attributes, id: it.id } : it;
        const value = raw.documentId ?? raw.document_id ?? raw.id ?? null;
        const label = raw.name ?? raw.title ?? '';
        return { value, label };
    });
};

// ตัวอย่าง fetch ที่ใช้ axios (คอมเมนต์ไว้เป็นตัวอย่าง)
// const fetchDepartments = async (token) => {
//   const res = await apiClient.get('/departments?populate=*', {
//     headers: { Authorization: `Bearer ${token}` }
//   });
//   const payload = res.data;
//   // normalize เหมือนข้างบน
//   return (Array.isArray(payload.data) ? payload.data : payload).map(d => {
//     const raw = d.attributes ? { ...d.attributes, id: d.id } : d;
//     return { value: raw.documentId ?? raw.id, label: raw.name ?? raw.title };
//   });
// };

// ...สร้างฟังก์ชัน fetch อื่นๆ ตามต้องการ...

export function useFormOptions(session) {
    const [options, setOptions] = useState({
        academicTypes: [],
        departments: [],
        faculties: [],
        // เพิ่ม options อื่นๆ ที่นี่
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (session?.jwt) {
            const token = session.jwt;

            const fetchAllOptions = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    // ยิง API พร้อมกันทั้งหมดด้วย Promise.all เพื่อความรวดเร็ว
                    const [academicTypesData] = await Promise.all([
                        fetchAcademicTypes(token),
                        // fetchDepartments(token),
                    ]);

                    setOptions({
                        academicTypes: academicTypesData,
                        // departments: departmentsData,
                        // faculties: facultiesData,
                    });

                } catch (err) {
                    setError(err.message);
                    console.error("Failed to fetch form options:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchAllOptions();
        }
    }, [session]); // ทำงานเมื่อ session เปลี่ยน

    return { options, loading, error };
}