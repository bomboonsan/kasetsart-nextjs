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