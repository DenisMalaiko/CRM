import { useMemo, useState, useEffect } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  resetDeps?: any[];
}

export function usePagination<T>({
   items,
   pageSize = 5,
   resetDeps = [],
 }: UsePaginationOptions<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  // reset page when dependencies change (e.g. sort)
  useEffect(() => {
    setPage(1);
  }, resetDeps);

  return {
    page,
    setPage,
    pageSize,
    totalPages,
    paginatedItems,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}