import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getAcademicTypeById = async (documentId) => {
    try {
        const response = await apiClient.get(`/academic-types/${encodeURIComponent(documentId)}`);
        return response.data.data.id;
    } catch (error) {
        console.error("Failed to fetch academic type by ID:", error);
        throw error.response ? error.response.data : error;
    }
};

export const fetchAcademicTypes = async (token) => {
    // ... ย้าย Logic การ fetch ทั้งหมดมาไว้ที่นี่ ...
}