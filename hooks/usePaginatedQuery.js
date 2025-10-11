import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client/react';

/**
 * Custom hook to automatically fetch all paginated data from GraphQL
 * Fetches data in chunks of 200 items until all data is retrieved
 * 
 * @param {DocumentNode} query - GraphQL query document
 * @param {Object} options - Apollo useQuery options
 * @returns {Object} - { data: mergedData, loading, error }
 */
export function usePaginatedQuery(query, options = {}) {
    const PAGE_SIZE = 1000;
    const [allData, setAllData] = useState(null);
    const [isLoadingAll, setIsLoadingAll] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const accumulatedData = useRef({});
    const firstFetch = useRef(true);

    const { data, loading, error, fetchMore } = useQuery(query, {
        ...options,
        variables: {
            ...options.variables,
            pagination: {
                page: currentPage,
                pageSize: PAGE_SIZE
            }
        },
        notifyOnNetworkStatusChange: true,
    });

    useEffect(() => {
        if (loading || error || !data) return;

        // First fetch - initialize accumulated data
        if (firstFetch.current) {
            firstFetch.current = false;

            // Check if any collection has more data
            let hasMoreData = false;
            const newAccumulated = {};

            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    newAccumulated[key] = [...data[key]];
                    if (data[key].length === PAGE_SIZE) {
                        hasMoreData = true;
                    }
                } else {
                    newAccumulated[key] = data[key];
                }
            });

            accumulatedData.current = newAccumulated;

            if (hasMoreData) {
                setCurrentPage(2);
                setHasMore(true);
            } else {
                setAllData(newAccumulated);
                setIsLoadingAll(false);
                setHasMore(false);
            }
        } else {
            // Subsequent fetches - merge data
            let hasMoreData = false;

            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    // Merge arrays
                    accumulatedData.current[key] = [
                        ...(accumulatedData.current[key] || []),
                        ...data[key]
                    ];

                    // Check if this collection has more data
                    if (data[key].length === PAGE_SIZE) {
                        hasMoreData = true;
                    }
                } else {
                    // Keep non-array data (like meta, departments, etc.)
                    accumulatedData.current[key] = data[key];
                }
            });

            if (hasMoreData) {
                setCurrentPage(prev => prev + 1);
            } else {
                setAllData({ ...accumulatedData.current });
                setIsLoadingAll(false);
                setHasMore(false);
            }
        }
    }, [data, loading, error]);

    // Fetch next page when currentPage changes
    useEffect(() => {
        if (currentPage > 1 && hasMore && !loading) {
            fetchMore({
                variables: {
                    ...options.variables,
                    pagination: {
                        page: currentPage,
                        pageSize: PAGE_SIZE
                    }
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                    return fetchMoreResult || prev;
                }
            });
        }
    }, [currentPage, hasMore, loading, fetchMore, options.variables]);

    return {
        data: allData,
        loading: isLoadingAll,
        error
    };
}
