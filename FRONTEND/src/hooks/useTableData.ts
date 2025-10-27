import { useMemo } from 'react';

interface UseTableDataProps<T> {
  data: T[];
  searchQuery: string;
  searchableColumns: (keyof T)[];
  sortKey: string | null;
  sortOrder: 'asc' | 'desc' | null;
  onSearchChange?: (query: string) => void;
}

export const useTableData = <T extends Record<string, any>>({
  data,
  searchQuery,
  searchableColumns,
  sortKey,
  sortOrder,
  onSearchChange,
}: UseTableDataProps<T>) => {
  return useMemo(() => {
    let processedData = [...data];

    // Client-side search (only if no external search handler)
    if (!onSearchChange && searchQuery && searchableColumns.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      processedData = processedData.filter((item) =>
        searchableColumns.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Client-side sorting
    if (sortKey && sortOrder) {
      processedData.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
        if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

        // Number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Date comparison
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder === 'asc' 
            ? aValue.getTime() - bValue.getTime() 
            : bValue.getTime() - aValue.getTime();
        }

        // String comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (sortOrder === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }

    return processedData;
  }, [data, searchQuery, searchableColumns, sortKey, sortOrder, onSearchChange]);
};