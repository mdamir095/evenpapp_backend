import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useServiceCategory } from '../hooks/useServiceCategory';
import { useServiceCategoryActions } from '../hooks/useServiceCategoryActions';
import { useNavigate } from 'react-router-dom';


const ServiceCategoryList: React.FC = () => {
  const { categories = [], pagination, loading } = useServiceCategory();
  const { getCategoryList, removeCategory,updateServiceCategoryStatus } = useServiceCategoryActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  type ServiceCategoryRow = { id: string; name: string; description?: string;isActive?: boolean; };
  const [selectedUser, setSelectedUser] = useState<ServiceCategoryRow | null>(null);

  // Fetch users when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getCategoryList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getCategoryList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, row: ServiceCategoryRow) => {
    if (action === 'edit') {
      navigate(`/service-category/${row.id}`);
    } else if (action === 'delete') {
      setSelectedUser(row);
      setShowDeleteModal(true);
    }

    else if (action === 'activate') {
      updateServiceCategoryStatus(row.id, {isActive: true});
      toast.success('Category activated successfully');
      getCategoryList(currentPage, rowsPerPage, searchQuery);
    }
    else if (action === 'deactivate') {
      updateServiceCategoryStatus(row.id, {isActive: false});
      toast.success('Category deactivated successfully');
      getCategoryList(currentPage, rowsPerPage, searchQuery);
    }
    else if (action === 'reset-password') {
      // Reset password functionality
    }
    else if (action === 'view') {
      // View service category
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await removeCategory(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('Category deleted successfully');
      // No need to refresh the list as Redux actions already update the state
    } catch (error) {
      // Error is already handled by Redux actions and displayed in UI
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };



  const columns: TableColumn<ServiceCategoryRow>[] = [
    { key: 'name', label: 'Name', width: 250, sortable: true, searchable: true },
    { key: 'description', label: 'Description', width: 300 },
    { 
      key: 'isActive', 
      label: 'Status', 
      width: 100,
      render: (value: any) => {
        const isActive = Boolean(value);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }
    },
  ];

  const sanitizedCategories: ServiceCategoryRow[] = (categories as any[])?.filter(Boolean).map((c: any) => ({
    id: (c.id ?? c.key ?? `${c.name || 'category'}-${Math.random().toString(36).slice(2,8)}`) as string,
    name: (c.name ?? '') as string,
    description: (c.description ?? undefined) as string | undefined,
    isActive: c.isActive, // Include isActive field from API data
  })) ?? [];

  return (
    <Layout>
      <>
      <div className='max-w-3xl'>
        <TableComponent<ServiceCategoryRow>
          columns={columns}
          data={sanitizedCategories}
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          currentPage={currentPage}
          featureName="Service Category"
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          heading="Service Category"
          searchBar
          searchQuery={searchQuery}
          showResetPasswordOption={false}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getCategoryList(1, size, searchQuery);
          }}
          loading={loading}
          showAddButton
          addButtonRoute="/service-category/new"
          addButtonText='Add Category'
          showLocationOption={false}
        />
          {showDeleteModal && selectedUser && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${selectedUser.name} service category?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
          

        </div>
      </>
    </Layout>
  );
};

export default ServiceCategoryList;
