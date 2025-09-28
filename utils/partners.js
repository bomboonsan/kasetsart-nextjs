export const normalizeDocumentId = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
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
