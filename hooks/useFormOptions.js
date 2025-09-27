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

    // normalize: ให้ผลลัพธ์เป็น { id, value, label }
    return items.map((it) => {
        const raw = it.attributes ? { ...it.attributes, id: it.id } : it;
        const id = it.id ?? raw.id ?? null;
        const value = raw.documentId ?? raw.document_id ?? id;
        const label = raw.name ?? raw.title ?? '';
        return { id, value, label };
    });
};

const fetchDepartments = async (token) => {
    const res = await apiClient.get('/departments?populate=*', {
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

    // normalize: ให้ผลลัพธ์เป็น { id, value, label }
    return items.map((it) => {
        const raw = it.attributes ? { ...it.attributes, id: it.id } : it;
        const id = it.id ?? raw.id ?? null;
        const value = raw.documentId ?? raw.document_id ?? id;
        const label = raw.name ?? raw.title ?? '';
        return { id, value, label };
    });
};

const fetchFaculties = async (token) => {
    const res = await apiClient.get('/faculties?populate=*', {
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

    // normalize: ให้ผลลัพธ์เป็น { id, value, label }
    return items.map((it) => {
        const raw = it.attributes ? { ...it.attributes, id: it.id } : it;
        const id = it.id ?? raw.id ?? null;
        const value = raw.documentId ?? raw.document_id ?? id;
        const label = raw.name ?? raw.title ?? '';
        return { id, value, label };
    });
};

const fetchOrganizations = async (token) => {
    const res = await apiClient.get('/organizations?populate=*', {
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

    // normalize: ให้ผลลัพธ์เป็น { id, value, label }
    return items.map((it) => {
        const raw = it.attributes ? { ...it.attributes, id: it.id } : it;
        const id = it.id ?? raw.id ?? null;
        const value = raw.documentId ?? raw.document_id ?? id;
        const label = raw.name ?? raw.title ?? '';
        return { id, value, label };
    });
};


export function useFormOptions(session) {
    const [options, setOptions] = useState({
        academicTypes: [],
        departments: [],
        faculties: [],
        organizations: [],
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
                    const [academicTypesData, departmentsData, facultiesData, organizationsData] = await Promise.all([
                        fetchAcademicTypes(token),
                        fetchDepartments(token),
                        fetchFaculties(token),
                        fetchOrganizations(token),
                    ]);
                    

                    setOptions({
                        academicTypes: academicTypesData,
                        departments: departmentsData,
                        faculties: facultiesData,
                        organizations: organizationsData,
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