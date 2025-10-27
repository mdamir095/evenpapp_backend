import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useCategoryActions } from '../hooks/useCategoryActions';
import { useCategory } from '../hooks/useCategory';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';


type VenueCategoryRow = { id: string; name: string; description?: string; isActive?: boolean; formId?: string };

const VenueCategoryList: React.FC = () => {
  const { categories = [], pagination, loading } = useCategory();
  const { getCategoryList, removeCategory, updateVenueCategoryStatus } = useCategoryActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VenueCategoryRow | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getCategoryList(currentPage, rowsPerPage, searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = async (action: TableAction, row: VenueCategoryRow) => {
    if (action === 'edit') navigate(`/venue-category-management/${row.id}`);
    else if (action === 'delete') {
      setSelectedUser(row);
      setShowDeleteModal(true);
    }

    else if (action === 'activate') {
      try {
        await updateVenueCategoryStatus(row.id, {isActive: true});
        toast.success('Category activated successfully');
        getCategoryList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to activate category');
      }
    }
    else if (action === 'deactivate') {
      try {
        await updateVenueCategoryStatus(row.id, { isActive: false });
        toast.success('Category deactivated successfully');
        getCategoryList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to deactivate category');
      }
    }
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    removeCategory(selectedUser.id);
    setShowDeleteModal(false);
    setSelectedUser(null);
    toast.success('Category deleted successfully');
    getCategoryList(currentPage, rowsPerPage, searchQuery);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };



  const columns: TableColumn<VenueCategoryRow>[] = [
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

  const sanitizedCategories: VenueCategoryRow[] = (categories as any[])?.filter(Boolean).map((c: any) => ({
    id: (c.id ?? c.key ?? `${c.name || 'category'}-${Math.random().toString(36).slice(2,8)}`) as string,
    name: (c.name ?? '') as string,
    description: (c.description ?? undefined) as string | undefined,
    isActive: c.isActive,
    formId: c.formId || '',
  })) ?? [];

  return (
    <Layout>
      <div className='max-w-3xl'>
          <TableComponent<VenueCategoryRow>
            columns={columns}
            data={sanitizedCategories}
            onRowAction={handleAction}
            total={pagination?.total ?? 0}
            currentPage={currentPage}
            uniqueId="venue_category"
            featureName="Venue Category"
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size);
              setCurrentPage(1);
              getCategoryList(1, size, searchQuery);
            }}
            heading="Venue Category"
            searchBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setCurrentPage(1);
              setSearchQuery(q);
            }}
            loading={loading}
            showAddButton
            addButtonRoute="/venue-category-management/new"
            addButtonText="Add Venue Category"
            showLocationOption={false}
          />
          {showDeleteModal && selectedUser && (
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
              title="Confirm Deletion"
              message={`Are you sure you want to delete ${selectedUser.name} category?`}
              confirmLabel="Delete"
              cancelLabel="Cancel"
            />
          )}
          

      </div>
    </Layout>
  );
};

export default VenueCategoryList;
