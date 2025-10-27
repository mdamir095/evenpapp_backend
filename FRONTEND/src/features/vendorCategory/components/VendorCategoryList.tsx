import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useVendorCategory } from '../hooks/useVendorCategory';
import { useVendorCategoryActions } from '../hooks/useVendorCategoryActions';
import { useNavigate } from 'react-router-dom';


type VendorCategoryRow = { id: string; name: string; description?: string; isActive?: boolean; formId?: string };

const VendorCategoryList: React.FC = () => {
  const { vendorCategories = [], pagination, loading, error } = useVendorCategory();
  const { getVendorCategoryList, removeVendorCategory, updateVendorCategoryStatus } = useVendorCategoryActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VendorCategoryRow | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getVendorCategoryList(currentPage, rowsPerPage, searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = async (action: TableAction, row: VendorCategoryRow) => {
    if (action === 'edit') {
      navigate(`/vendor-category-management/${row.id}`);
    } else if (action === 'delete') {
      setSelectedUser(row);
      setShowDeleteModal(true);
    }

    else if (action === 'activate') {
      try {
        await updateVendorCategoryStatus(row.id, {isActive: true});
        toast.success('Vendor Category activated successfully');
        getVendorCategoryList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to activate category');
      }
    }
    else if (action === 'deactivate') {
      try {
        await updateVendorCategoryStatus(row.id, {isActive: false});
        toast.success('Vendor Category deactivated successfully');
        getVendorCategoryList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to deactivate category');
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await removeVendorCategory(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('Vendor Category deleted successfully');
    } catch (error) {
      // Error is already handled by Redux actions and displayed in UI
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };



  const columns: TableColumn<VendorCategoryRow>[] = [
    { key: 'name', label: 'Name', width: 250, sortable: true, searchable: true },
    { key: 'description', label: 'Description', width: 300 },
    { 
      key: 'isActive', 
      label: 'Status', 
      width: 100,
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          Boolean(value) 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {Boolean(value) ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const sanitizedVendorCategories: VendorCategoryRow[] = (vendorCategories as any[])?.filter(Boolean).map((v: any) => ({
    id: (v.id ?? v.key ?? `${v.name || 'category'}-${Math.random().toString(36).slice(2, 8)}`) as string,
    name: (v.name ?? '') as string,
    description: (v.description ?? undefined) as string | undefined,
    isActive: v.isActive,
    formId: v.formId || '',
  })) ?? [];

  return (
    <Layout>
      <>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className='max-w-3xl'>
            <TableComponent<VendorCategoryRow>
              columns={columns}
              data={sanitizedVendorCategories}
              onRowAction={handleAction}
              total={pagination?.total ?? 0}
              currentPage={currentPage}
              uniqueId="vendor_category"
              featureName="Vendor Category"
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={(size) => {
                setRowsPerPage(size);
                setCurrentPage(1);
                getVendorCategoryList(1, size, searchQuery);
              }}
              heading="Vendor Category"
              searchBar
              searchQuery={searchQuery}
              showResetPasswordOption={false}
              onSearchChange={(q) => {
                setCurrentPage(1);
                setSearchQuery(q);
              }}
              loading={loading}
              showAddButton
              addButtonRoute="/vendor-category-management/new"
              addButtonText='Add Vendor Category'
              showLocationOption={false}
            />
            {showDeleteModal && selectedUser && (
              <ConfirmModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${selectedUser.name} vendor category?`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
              />
            )}
            

          </div>
      </>
    </Layout>
  );
};

export default VendorCategoryList;
