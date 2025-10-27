import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useEmployeeActions } from '../hooks/useEmployeeActions';
import { useEmployee } from '../hooks/useEmployee';
import TableComponent from '../../../components/atoms/Table';
import { useToast } from '../../../components/atoms/Toast';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';


import type { TableColumn } from '../../../types/table';
import { Plus } from 'lucide-react';
import { getUserDataFromStorage, isSuperAdmin } from '../../../utils/permissions';

const EmployeeList: React.FC = () => {
  const { employees = [], pagination, loading } = useEmployee();
  const { getEmployeeList, removeEmployee, getEnterpriseList, resetEmployeePassword, updateEmployeeStatus, blockEmployee} = useEmployeeActions();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const isUserSuperAdmin = isSuperAdmin(getUserDataFromStorage());

  // Load enterprises for Super Admin
  useEffect(() => {
    if (isUserSuperAdmin && enterprises.length === 0) {
      const loadEnterprises = async () => {
        try {
          const enterpriseData = await getEnterpriseList();
          setEnterprises(Array.isArray(enterpriseData) ? enterpriseData : []);
        } catch (error) {
          setEnterprises([]);
        }
      };
      loadEnterprises();
    }
  }, [isUserSuperAdmin]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // For Super Admin, if enterprise is selected, send enterprise name in searchQuery
      const searchParam = isUserSuperAdmin && selectedEnterprise ? selectedEnterprise : searchQuery;
      getEmployeeList(currentPage, rowsPerPage, searchParam);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, selectedEnterprise, rowsPerPage, isUserSuperAdmin]);



  const confirmDelete = () => {
    if (selectedUser) {
      removeEmployee(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
      getEmployeeList(currentPage, rowsPerPage, searchQuery); 
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  type UserRow = { id: string; firstName: string; lastName: string; email: string; enterpriseName: string; organizationName: string; isActive?: boolean; isBlocked?: boolean };

  const columns: TableColumn<UserRow>[] = [
    { key: 'firstName', label: 'First Name', sortable: true, searchable: true, width: 150 },
    { key: 'lastName',  label: 'Last Name',  sortable: true, searchable: true, width: 150 },
    { key: 'email',     label: 'Email',      sortable: true, searchable: true, width: 250 },
    { key: 'enterpriseName', label: 'Enterprise Name', sortable: true, width: 250 },
    { key: 'organizationName', label: 'Organization Name', sortable: true, width: 250 },
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
  const sanitizedEmployees = employees?.filter(Boolean).map((employee: any) => ({
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    enterpriseName: employee.enterpriseName || '',
    organizationName: employee.organizationName || '',
    isActive: employee.isActive,
    isBlocked: employee.isBlocked
  })) ?? [];
  return (
    <Layout>
      <TableComponent<UserRow>
        columns={columns}
        data={sanitizedEmployees}
        heading="Employee Management"
        showAddButton
        addButtonText="Add Employee"
        addButtonRoute="/employee-management/new"
        addButtonIcon={<Plus className="size-4" />}
        featureName="Employee Management"   // match the exact key your app uses
        searchBar
        showResetPasswordOption
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setCurrentPage(1);
          setSearchQuery(q);
          // useEffect will handle the API call automatically
        }}
        total={pagination?.total ?? 0}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          // useEffect will handle the API call automatically
        }}
        loading={loading}
        onRowAction={async (action, row) => {
          if (action === 'edit') navigate(`/employee-management/edit/${row.id}`);
          if (action === 'delete') { setSelectedUser(row); setShowDeleteModal(true); }
          if (action === 'reset-password') {
            try {
              await resetEmployeePassword(row.email);
              toast.success('Password reset link sent successfully!');
            } catch (error: any) {
              toast.error(error.message || 'Failed to send reset link');
            }
          }
          if (action === 'activate') {
            try {
              await updateEmployeeStatus(row.id, true);
              toast.success('Employee activated successfully!');
              getEmployeeList(currentPage, rowsPerPage, searchQuery, selectedEnterprise);
            } catch (error: any) {
              toast.error(error.message || 'Failed to activate employee');
            }
          }
          if (action === 'deactivate') {
            try {
              await updateEmployeeStatus(row.id, false);
              toast.success('Employee deactivated successfully!');
              getEmployeeList(currentPage, rowsPerPage, searchQuery, selectedEnterprise);
            } catch (error: any) {
              toast.error(error.message || 'Failed to deactivate employee');
            }
          }
          if (action === 'block') {
            try {
              await blockEmployee(row.id, { isBlocked: true });
              toast.success('Employee blocked successfully!');
              getEmployeeList(currentPage, rowsPerPage, searchQuery, selectedEnterprise);
            } catch (error: any) {
              toast.error(error.message || 'Failed to block employee');
            }
          }
          if (action === 'unblock') {
            try {
              await blockEmployee(row.id, { isBlocked: false });
              toast.success('Employee unblocked successfully!');
              getEmployeeList(currentPage, rowsPerPage, searchQuery, selectedEnterprise);
            } catch (error: any) {
              toast.error(error.message || 'Failed to unblock employee');
            }
          }
        }}
        {...(isUserSuperAdmin && {
          enterprisesDropdown: {
            enterprises: enterprises || [],
            selectedEnterprise: selectedEnterprise,
            onEnterpriseChange: (val) => {
              setSelectedEnterprise(val);
              setCurrentPage(1);
              // useEffect will handle the API call automatically
            }
          }
        })}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setCurrentPage(1);
          // useEffect will handle the API call automatically
        }}
      />


      {showDeleteModal && selectedUser && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete employee ${selectedUser.firstName} ${selectedUser.lastName}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </Layout>
  );
};

export default EmployeeList;