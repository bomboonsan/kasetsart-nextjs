export const formatToDigitsOnly = (value) => {
    if (!value) return '';
    return value.replace(/[^0-9]/g, '');
};

export const formatToEnglishOnly = (value) => {
    if (!value) return '';
    return value.replace(/[^a-zA-Z ]/g, '');
};

export const formatToThaiOnly = (value) => {
    if (!value) return '';
    return value.replace(/[^ก-๙ ]/g, '');
};

export const formatDateToDDMMYYYY = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export const formatDateToMMYYYY = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
}