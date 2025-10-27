import React, { useState, useMemo } from 'react';
import { Button } from '../atoms/Button';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaginationBar from './Pagination';

type Column = {
  key: string;
  label: string;
  width?: number;
};
 const navigate = useNavigate();
type SortOrder = 'asc' | 'desc' | null;
 const [page, setPage] = useState(1);

type TableComponentProps<T> = {
  columns: Column[];
  data: T[];
  onRowAction?: (action: 'edit' | 'delete', row: T) => void;
  rowsPerPage?: number;
  searchableColumns?: string[];
};

function TableComponent<T extends { id: string | number }>({
  columns,
  data,
  onRowAction,
  rowsPerPage = 5,
  searchableColumns = [],
}: TableComponentProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    let newOrder: SortOrder = 'asc';
    if (sortKey === key && sortOrder === 'asc') newOrder = 'desc';
    else if (sortKey === key && sortOrder === 'desc') newOrder = null;

    setSortKey(newOrder ? key : null);
    setSortOrder(newOrder);
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        searchableColumns.some((key) =>
          String(item[key as keyof T]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (sortKey && sortOrder) {
      filtered.sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          return sortOrder === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        }
      });
    }

    return filtered;
  }, [data, sortKey, sortOrder, searchQuery, searchableColumns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div>
      {/* <div className="mb-3">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded w-full max-w-sm"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div> */}
      
          {/*  */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width ?? 150 }}
                  className="px-4 py-2 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                </th>
              ))}
              {onRowAction && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ width: col.width ?? 150 }}
                    className="px-4 py-2 whitespace-nowrap"
                  >
                    {String(row[col.key as keyof T])}
                  </td>
                ))}
                {onRowAction && (
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="text-blue-500"
                      onClick={() => onRowAction('edit', row)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => onRowAction('delete', row)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full mx-auto mt-6">
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            pageSize={rowsPerPage}
            totalItems={filteredData.length}
            onPageChange={setPage}
          />
    </div>
      )}
    </div>
  );
}

export default TableComponent;
