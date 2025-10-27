import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useUserActions } from '../hooks/useUserActions';
import { useUser } from '../hooks/useUser';
import TableComponent from '../../../components/atoms/Table';
import { useToast } from '../../../components/atoms/Toast';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';

import type { TableColumn } from '../../../types/table';

const UserList: React.FC = () => {
  const { users = [], pagination, loading, roles } = useUser();
  const { getUserList, removeUser, fetchRoles, resetUserPassword, updateUserStatus, blockUser } = useUserActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRoles()
      getUserList(currentPage, rowsPerPage, searchQuery,selectedRole);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, selectedRole, rowsPerPage]);



  const confirmDelete = () => {
    if (selectedUser) {
      removeUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
      getUserList(currentPage, rowsPerPage, searchQuery, selectedRole); 
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  type UserRow = { id: string; firstName: string; lastName: string; email: string; organizationName: string; isActive?: boolean; isBlocked?: boolean };

  const columns: TableColumn<UserRow>[] = [
    { key: 'firstName', label: 'First Name', sortable: true, searchable: true, width: 150 },
    { key: 'lastName',  label: 'Last Name',  sortable: true, searchable: true, width: 150 },
    { key: 'email',     label: 'Email',      sortable: true, searchable: true, width: 250 },
    { key: 'organizationName', label: 'Organization', sortable: true, width: 200 },
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
    { 
      key: 'isBlocked', 
      label: 'Block Status', 
      width: 100,
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          Boolean(value) 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {Boolean(value) ? 'Blocked' : 'Unblocked'}
        </span>
      )
    },
  ];
  const sanitizedUsers = users?.filter(Boolean).map((user: any) => ({
    ...user,
    isActive: user.isActive,
    isBlocked: user.isBlocked
  })) ?? [];
  return (
    <Layout>
      <TableComponent<UserRow>
        columns={columns}
        data={sanitizedUsers}
        heading="User Management"
        showAddButton
        addButtonRoute="/user-management/new"
        featureName="Role Management"   // match the exact key your app uses
        showResetPasswordOption
        searchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setCurrentPage(1);
          setSearchQuery(q);
          getUserList(1, rowsPerPage, q, selectedRole);
        }}
        total={pagination?.total ?? 0}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          getUserList(page, rowsPerPage, searchQuery, selectedRole);
        }}
        loading={loading}
        onRowAction={async (action, row) => {
          if (action === 'edit') navigate(`/user-management/${row.id}`);
          if (action === 'delete') { setSelectedUser(row); setShowDeleteModal(true); }
          if (action === 'reset-password') {
            try {
              await resetUserPassword(row.email);
              toast.success('Password reset link sent successfully!');
            } catch (error: any) {
              toast.error(error.message || 'Failed to send reset link');
            }
          }
          if (action === 'activate') {
            try {
              await updateUserStatus(row.id, true);
              toast.success('User activated successfully!');
              getUserList(currentPage, rowsPerPage, searchQuery, selectedRole);
            } catch (error: any) {
              toast.error(error.message || 'Failed to activate user');
            }
          }
          if (action === 'deactivate') {
            try {
              await updateUserStatus(row.id, false);
              toast.success('User deactivated successfully!');
              getUserList(currentPage, rowsPerPage, searchQuery, selectedRole);
            } catch (error: any) {
              toast.error(error.message || 'Failed to deactivate user');
            }
          }
          if (action === 'block') {
            try {
              await blockUser(row.id, { isBlocked: true });
              toast.success('User blocked successfully!');
              getUserList(currentPage, rowsPerPage, searchQuery, selectedRole);
            } catch (error: any) {
              toast.error(error.message || 'Failed to block user');
            }
          }
          if (action === 'unblock') {
            try {
              await blockUser(row.id, { isBlocked: false });
              toast.success('User unblocked successfully!');
              getUserList(currentPage, rowsPerPage, searchQuery, selectedRole);
            } catch (error: any) {
              toast.error(error.message || 'Failed to unblock user');
            }
          }
        }}
        rolesDropdown={{
          roles: roles || [],
          selectedRole: selectedRole,
          onRoleChange: (val) => {
            setSelectedRole(val);
            setCurrentPage(1);
            getUserList(1, rowsPerPage, searchQuery, val);
          }
        }}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setCurrentPage(1);
          getUserList(1, size, searchQuery, selectedRole);
        }}
      />


      {showDeleteModal && selectedUser && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete user ${selectedUser.firstName} ${selectedUser.lastName}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </Layout>
  );
};

export default UserList;
