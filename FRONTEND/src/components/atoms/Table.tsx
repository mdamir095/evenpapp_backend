import { useMemo, useState, useCallback } from "react";
import { Download, Plus, Filter, Search } from "lucide-react";
import { NoData } from "../common/NoData";
import TableSkeleton from "../common/TableSkeleton";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import PaginationBar from "../common/Pagination";
import { SelectGroup } from "../molecules/SelectGroup";
import { RowActionMenu } from "./RowActionMenu";
import { DropDown } from "./DropDown";
import clsx from 'clsx';

import { useTablePermissions } from '../../hooks/useTablePermissions';
import { useTableData } from '../../hooks/useTableData';
import type { TableColumn, TableRow, TableComponentProps } from '../../types/table';
import SearchBox from "./SearchBox";

function TableComponent<T extends TableRow>(props: TableComponentProps<T>) {
  const {
    columns,
    data,
    onRowAction,
    rowsPerPage = 10,
    searchableColumns = [],
    total = 0,
    currentPage = 1,
    onPageChange,
    onRowsPerPageChange,
    searchQuery = "",
    onSearchChange,
    loading = false,
    addButtonRoute = "/user-management/new",
    addButtonText = "Add User",
    addButtonIcon = <Plus className="size-4" />,
    showAddButton = false,
    searchBar,
    actionButtons,
    roleSelect,
    heading,
    featureName,
    uniqueId,
    showResetPasswordOption = false,
    rolesDropdown,
    enterprisesDropdown,
    hideDeleteAction = false,
    showLocationOption = false,
    showQuotationOption = false,
  } = props;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const navigate = useNavigate();

  // Step 1: Use custom hook for permissions (replaces embedded localStorage logic)
  const permissions = useTablePermissions({ featureName, uniqueId, showResetPasswordOption });
  const { canAdd, canEdit, canDelete, canResetPassword } = permissions;

  // Step 2: Use custom hook for data processing (replaces embedded search/sort logic)
  const processedData = useTableData({
    data,
    searchQuery: onSearchChange ? "" : searchQuery, // Only use client-side search if no server-side handler
    searchableColumns: searchableColumns as (keyof T)[],
    sortKey,
    sortOrder,
    onSearchChange,
  });

  // Step 3: Add proper render function with type safety
  const renderCellContent = useCallback((column: TableColumn<T>, row: T, index: number) => {
    const value = row[column.key];
    
    // Use custom render function if provided
    if (column.render) {
      return column.render(value, row, index);
    }
    
    // Default rendering with proper type guards
    if (value == null) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value && (value as any) instanceof Date) return value.toLocaleDateString();
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") return value;
    
    // Fallback for other types (objects, arrays, etc.)
    return String(value);
  }, []);

  // Step 4: Optimize event handlers with useCallback
  const handleSort = useCallback((key: string) => {
    let newOrder: "asc" | "desc" | null = "asc";
    if (sortKey === key && sortOrder === "asc") newOrder = "desc";
    else if (sortKey === key && sortOrder === "desc") newOrder = null;
    
    setSortKey(newOrder ? key : null);
    setSortOrder(newOrder);
    
    // Call the data hook's sort handler
    // onSort(key, newOrder);
  }, [sortKey, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    onPageChange?.(page);
  }, [onPageChange]);

  const handleSearchChange = useCallback((query: string) => {
    onSearchChange?.(query);
  }, [onSearchChange]);

  const handleAddClick = useCallback(() => {
    navigate(addButtonRoute);
  }, [navigate, addButtonRoute]);

  // Step 5: Memoize computed values for performance
  const totalPages = useMemo(() => Math.ceil(total / rowsPerPage), [total, rowsPerPage]);
  
  const shouldShowActions = useMemo(() => 
    onRowAction && (canEdit || canDelete || canResetPassword), 
    [onRowAction, canEdit, canDelete, canResetPassword]
  );

  const tableColumns = useMemo(() => 
    columns as TableColumn<T>[], 
    [columns]
  );

  // Step 6: Use processed data from hook or fallback to original data
  const displayData = useMemo(() => 
    onSearchChange ? data : processedData, 
    [onSearchChange, data, processedData]
  );

  return (
    <>  
      <div className="rounded-lg shadow-sm bg-white p-6 grid gap-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-0">{heading}</h2>
            {/* Roles Dropdown - only show for User Management */}
            {heading === 'User Management' && rolesDropdown && (
              <div className="flex gap-4 items-center justify-between">
                <DropDown
                  options={[
                    { label: 'All Roles', value: '' },
                    ...(Array.isArray(rolesDropdown.roles) ? rolesDropdown.roles.map((role) => ({ label: role.name, value: role.name })) : [])
                  ]}
                  value={rolesDropdown.selectedRole}
                  onChange={rolesDropdown.onRoleChange}
                  error={false}
                  className='ml-auto'
                />
            </div>
          )}
          
          {/* Enterprises Dropdown - only show for Employee Management */}
          {heading === 'Employee Management' && enterprisesDropdown && (
            <div className="flex gap-4 items-center justify-between">
              <DropDown
                options={[
                  { label: 'All Enterprises', value: '' },
                  ...(Array.isArray(enterprisesDropdown.enterprises) ? enterprisesDropdown.enterprises.map((enterprise) => ({ label: enterprise.enterpriseName, value: enterprise.enterpriseName })) : [])
                ]}
                value={enterprisesDropdown.selectedEnterprise}
                onChange={enterprisesDropdown.onEnterpriseChange}
                error={false}
                className='ml-auto'
              />
          </div>
        )}
        </div>
        {/* Step 7: Clean up UI element rendering */}
        <div className={clsx('items-center gap-4 flex-col md:flex-row justify-end', {
          'd-none': !searchBar && !actionButtons && !roleSelect && !showAddButton,
          'flex': searchBar || actionButtons || roleSelect || showAddButton
        })}>
          {/* Search Bar Section */}
          {searchBar && (
            <SearchBox
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for id, name, product"
              className=""
            />
          )}

          {/* Action Buttons Section */}
          <div className={clsx('items-center gap-2 ml-auto', {
            'd-none': !actionButtons && !roleSelect && !showAddButton,
            'flex': actionButtons || roleSelect || showAddButton
          })}>
            
            {actionButtons && (
              <>
                <Button variant="muted" size="sm" className="flex items-center gap-1">
                  <Filter className="size-4" />
                  Filter
                </Button>
                <Button variant="muted" size="sm" className="flex items-center gap-1">
                  <Download className="size-4" />
                  Export
                </Button>
              </>
            )}

            {roleSelect && (
              <SelectGroup
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Manager", value: "manager" },
                  { label: "Editor", value: "editor" },
                ]}
                value={[]}
                heightClass="min-h-[43px]"
                onChange={(selected) => {/* Selection handled */}}
                label=""
              />
            )}

            {showAddButton && canAdd && (
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap"
                onClick={handleAddClick}
              >
                {/* {addButtonIcon} */}
                {addButtonText}
              </Button>
            )}
          </div>
        </div>

        {/* Step 8: Table with improved structure and accessibility */}
        <div className="overflow-hidden rounded-xl border border-gray-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-md bg-white">
              <thead className="bg-neutral-100 font-normal">
                <tr>
                  {tableColumns.map((col, index) => (
                    <th
                      key={String(col.key)}
                      onClick={() => handleSort(String(col.key))}
                      style={col.width ? { width: col.width } : {}}
                      className={clsx(
                        "px-4 py-3 cursor-pointer whitespace-nowrap  border-b border-neutral-300 text-sm font-semibold",
                        {
                          "text-center": index === tableColumns.length - 1 && !shouldShowActions
                        }
                      )}
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={
                        sortKey === String(col.key) 
                          ? sortOrder === "asc" ? "ascending" : "descending"
                          : "none"
                      }
                    >
                      {col.label}
                    </th>
                  ))}
                  {shouldShowActions && (
                    <th className="px-4 py-3 text-center  w-[10%] border-b border-neutral-300 text-sm font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // <tr>
                  //   <td colSpan={tableColumns.length + (shouldShowActions ? 1 : 0)} className="text-center py-4 text-sm">
                  //     <LoaderNoData />
                  //   </td>
                  // </tr>
                  <TableSkeleton 
                  columns={columns.length + (onRowAction && (canEdit || canDelete || canResetPassword) ? 1 : 0)} 
                  rows={rowsPerPage} 
                />
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumns.length + (shouldShowActions ? 1 : 0)} className="text-center py-4 cursor-default text-sm">
                      <NoData />
                    </td>
                  </tr>
                ) : (
                  displayData.map((row: T, index: number) => (
                    <tr key={row.id ?? index} className="border-b border-gray-100">
                      {tableColumns.map((col) => (
                        <td key={String(col.key)} className="px-4 py-3 cursor-default  text-sm" style={{ width: col.width ?? 150 }}>
                          {renderCellContent(col, row, index)}
                        </td>
                      ))}
                      {shouldShowActions && (
                        <td className="px-4 py-0 whitespace-nowrap w-[10%] text-center">
                          <RowActionMenu
                            canEdit={canEdit}
                            canDelete={canDelete && !hideDeleteAction}
                            canResetPassword={canResetPassword}
                            canActivate={canEdit}
                            canDeactivate={canEdit}
                            isActive={Boolean((row as any)?.isActive)}
                            onEdit={() => onRowAction?.("edit", row)}
                            onDelete={() => onRowAction?.("delete", row)}
                            onResetPassword={() => onRowAction?.("reset-password", row)}
                            onActivate={() => onRowAction?.("activate", row)}
                            onDeactivate={() => onRowAction?.("deactivate", row)}
                            onBlock={() => onRowAction?.("block", row)}
                            onUnblock={() => onRowAction?.("unblock", row)}
                            onLocation={() => onRowAction?.("add location", row)}
                            onQuotation={() => onRowAction?.("quotation", row)}
                            canBlock={canEdit}
                            canUnblock={canEdit}
                            isBlocked={Boolean((row as any)?.isBlocked)}
                            showLocationOption={showLocationOption}
                            showQuotationOption={showQuotationOption}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Step 9: Pagination with proper conditional rendering */}
            {totalPages > 0 && (
              <div className="w-full mx-auto">
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={rowsPerPage}
                  totalItems={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={onRowsPerPageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TableComponent;