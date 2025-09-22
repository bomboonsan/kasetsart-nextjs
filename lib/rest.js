import axios from 'axios';

export const getAcademicTypesID = async (documentId) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/academic-types/${encodeURIComponent(documentId)}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};