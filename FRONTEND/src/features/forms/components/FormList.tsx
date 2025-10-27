import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { useToast } from '../../../components/atoms/Toast';
import { useUser } from '../../user/hooks/useUser';
import { useDynamicFormActions } from '../../user/hooks/dynamicFormActions';
import { ROUTING } from '../../../constants/routes';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';

const DynamicFormList: React.FC = () => {
  const { users = [], pagination, loading, roles } = useUser();
  const { getFormList, removeForm } = useDynamicFormActions();

  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  type FormRow = { id: string; key: string; name: string; description?: string };
  const [selectedUser, setSelectedUser] = useState<FormRow | null>(null);

  // Check pagination data

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getFormList(currentPage, rowsPerPage, searchQuery, selectedRole);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getFormList, currentPage, searchQuery, selectedRole, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, row: FormRow) => {
    if (action === 'edit') navigate(`/form-builder?id=${row.key}`);
    else if (action === 'delete') {
      setSelectedUser(row);
      setShowDeleteModal(true);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    removeForm(selectedUser.key);
    setShowDeleteModal(false);
    setSelectedUser(null);
    toast.success('Form deleted successfully');
    setTimeout(() => {
      getFormList(currentPage, rowsPerPage, searchQuery,selectedRole);
    }, 500);
  };
  

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const columns: TableColumn<FormRow>[] = [
    { key: 'name', label: 'Name', width: 250, sortable: true, searchable: true },
    { key: 'description', label: 'Description', width: 250 },
  ];
 const sanitizedUsers: FormRow[] = Array.isArray(users)
  ? users.filter(Boolean).map((u:any) => ({
      id: (u.id ?? u.key) as string,
      key: u.key as string,
      name: u.name as string,
      description: u.description as string | undefined,
    }))
  : [];

  return (
    <Layout>
      <TableComponent<FormRow>
        heading={'Form Management'}
        columns={columns}
        data={sanitizedUsers}
        onRowAction={handleAction}
        total={pagination?.total ?? 0}
        featureName="Form Builder"
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setCurrentPage(1);
          setSearchQuery(q);
        }}
        addButtonText={"Add Form"}
        addButtonRoute={ROUTING.FORM_BUILDER}
        loading={loading}
        showAddButton={true}
      />

      {showDeleteModal && selectedUser && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this form?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </Layout>
  );
};

export default DynamicFormList;
