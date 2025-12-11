export const normalizeDocumentId = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    // Handle BigInt - convert to string immediately
    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            for (const item of value) {
                const normalized = normalizeDocumentId(item);
                if (normalized) {
                    return normalized;
                }
            }
            return null;
        }

        const objectCandidates = [
            value.documentId,
            value.documentID,
            value.document_id,
            value.id,
            value.userID,
            value.userId,
            value.user_id,
        ];

        for (const candidate of objectCandidates) {
            const normalized = normalizeDocumentId(candidate);
            if (normalized) {
                return normalized;
            }
        }

        return null;
    }

    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
        return String(numeric);
    }

    const str = String(value).trim();
    return str.length ? str : null;
};

export const extractInternalUserIds = (partners) => {
    if (!Array.isArray(partners)) {
        return [];
    }

    const collected = [];

    for (const partner of partners) {
        if (!partner || partner.isInternal === false) {
            continue;
        }

        if (partner.isInternal !== true && partner.isInternal !== 1 && partner.isInternal !== '1') {
            continue;
        }

        const candidates = [
            partner.userID,
            partner.userId,
            partner.user_id,
            partner.User,
            partner.user,
            partner.modalUserObj,
        ];

        for (const candidate of candidates) {
            const normalized = normalizeDocumentId(candidate);
            if (normalized) {
                collected.push(normalized);
                break;
            }
        }
    }

    return Array.from(new Set(collected));
};

/**
 * Sanitize an object/array for GraphQL by converting all BigInt values to strings.
 * This recursively processes nested objects and arrays.
 * @param {any} input - The value to sanitize
 * @returns {any} - The sanitized value with BigInt converted to string
 */
export const sanitizeForGraphQL = (input) => {
    // Handle null/undefined
    if (input === null || input === undefined) {
        return input;
    }

    // Handle BigInt - convert to string
    if (typeof input === 'bigint') {
        return input.toString();
    }

    // Handle arrays - recursively sanitize each element
    if (Array.isArray(input)) {
        return input.map(item => sanitizeForGraphQL(item));
    }

    // Handle objects - recursively sanitize each value
    if (typeof input === 'object') {
        const sanitized = {};
        for (const key of Object.keys(input)) {
            // Skip __typename fields
            if (key === '__typename') continue;
            sanitized[key] = sanitizeForGraphQL(input[key]);
        }
        return sanitized;
    }

    // Handle primitives (string, number, boolean) - return as-is
    return input;
};
