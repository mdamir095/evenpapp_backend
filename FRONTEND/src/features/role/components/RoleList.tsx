import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import { useRoleActions } from '../hooks/useRoleActions';
import { useRole } from '../hooks/useRole';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';

import {ConfirmModal} from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import RoleForm from './RoleForm';
import { useNavigate } from 'react-router-dom';

const RoleList: React.FC = () => {
  const { roles = [], pagination, loading, error } = useRole();
  const { getRoleList, removeRole } = useRoleActions();
  const navigate = useNavigate();
  
  const tableData = React.useMemo(() => {
    return roles?.filter(Boolean) ?? [];
  }, [roles]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  type RoleRow = { id: string; name: string };
  const [selectedUser, setSelectedUser] = useState<RoleRow | null>(null);
  
  // State for inline editing
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(true); // Default to true - form open by default

  // Fetch users when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getRoleList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getRoleList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, role: RoleRow) => {
    if (action === 'edit') 
      // setEditingRole(role);
      navigate(`/role-management/${role.id}`);
      // setIsFormVisible(true);
    
    else if (action === 'delete') {
      setSelectedUser(role);
      setShowDeleteModal(true);
    }
    else if (action === 'view') {
      // View role action
    }
  };

  const handleFormSuccess = () => {
    const wasEditing = Boolean(editingRole);
    setEditingRole(null);
    // No need to refresh the list as Redux actions already update the state
    toast.success(wasEditing ? 'Role updated successfully' : 'Role created successfully');
  };

  const handleFormCancel = () => {
    setEditingRole(null);
    // Keep form visible since it should always be open
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await removeRole(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('Role deleted successfully');
      // No need to refresh the list as Redux actions already update the state
    } catch (error) {
      // Error is already handled by Redux actions and displayed in UI
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const columns: TableColumn<RoleRow>[] = [
    { key: 'name', label: 'Name', sortable: true, searchable: true, width: 250 },
  ];

  return (
    <Layout>
      <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className='max-w-3xl'>
        <TableComponent<RoleRow>
          key={`roles-table-${roles.length}`}
          columns={columns}
          data={tableData}
          heading="Role Management"
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          featureName="Role Management"
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getRoleList(1, size, searchQuery);
          }}
          searchBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          loading={loading}
          showAddButton
          addButtonRoute="/role-management/new"
          addButtonText='Add Role'
        />
          {showDeleteModal && selectedUser && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${selectedUser.name} role?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
          {/* {isFormVisible ? (
            <RoleForm
              editingRole={editingRole}
              onFormSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <div className="p-8 text-gray-500 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Role Form</h3>
              <p>Click "Add Role" to create a new role or click "Edit" on any role to modify it.</p>
            </div>
          )} */}
        </div>
      </>
    </Layout>
  );
};

export default RoleList;
