import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useEnterpriseActions } from '../hooks/useEnterpriseActions';
import { useEnterprise } from '../hooks/useEnterprise';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { useToast } from '../../../components/atoms/Toast';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';

// Define types inline or import from your types file
interface EnterprisePermission {
  read: boolean;
  write: boolean;
  admin: boolean;
}

interface EnterpriseFeature {
  featureId: string;
  permissions: EnterprisePermission;
}

export interface Enterprise {
  key: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  enterpriseName: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  countryCode: string;
  features?: EnterpriseFeature[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const EnterpriseList: React.FC = () => {
  const { enterprises = [], pagination, loading } = useEnterprise();
  const { getEnterpriseList, removeEnterprise, resetEnterprisePassword, updateEnterpriseStatus } = useEnterpriseActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  // Fetch enterprises when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getEnterpriseList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = async (action: TableAction, enterprise: Enterprise) => {
    if (action === 'edit') navigate(`/enterprise-management/${enterprise.key}`);
    else if (action === 'delete') {
      setSelectedEnterprise(enterprise);
      setShowDeleteModal(true);
    }
    else if (action === 'reset-password') {
      try {
        await resetEnterprisePassword(enterprise.email);
        toast.success('Password reset link sent successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to send reset link');
      }
    }
    else if (action === 'activate') {
      try {
        await updateEnterpriseStatus(enterprise.id, true);
        toast.success('Enterprise activated successfully!');
        getEnterpriseList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to activate enterprise');
      }
    }
    else if (action === 'deactivate') {
      try {
        await updateEnterpriseStatus(enterprise.id, false);
        toast.success('Enterprise deactivated successfully!');
        getEnterpriseList(currentPage, rowsPerPage, searchQuery);
      } catch (error: any) {
        toast.error(error.message || 'Failed to deactivate enterprise');
      }
    }
  };

  const confirmDelete = () => {
    if (selectedEnterprise) {
      removeEnterprise(selectedEnterprise.key ?? '');
      setShowDeleteModal(false);
      setSelectedEnterprise(null);
      toast.success('Enterprise deleted successfully');
      getEnterpriseList(currentPage, rowsPerPage, searchQuery);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedEnterprise(null);
  };

  type EnterpriseRow = Enterprise;

  const columns: TableColumn<EnterpriseRow>[] = [
    { key: 'firstName', label: 'First Name', width: 160, sortable: true, searchable: true },
    { key: 'lastName', label: 'Last Name', width: 160, sortable: true, searchable: true },
    { key: 'email', label: 'Email', width: 200, sortable: true, searchable: true },
    { key: 'phoneNumber', label: 'Phone Number', width: 140, searchable: true },
    { key: 'enterpriseName', label: 'Enterprise Name', width: 200, sortable: true, searchable: true },
    { key: 'description', label: 'Description', width: 200 },
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

  const sanitizedEnterprises: Enterprise[] =
  enterprises?.filter(Boolean).map((e:any) => ({ ...e, key: e.key || e.id })) ?? [];

  return (
    <Layout>
      {/* <div className="flex gap-4 mb-6 items-center">
        <h2 className="text-xl font-semibold mb-0">Enterprise Management</h2>
        <Button
          onClick={() => navigate('/enterprise-management/new')}
          className=" ml-auto"
          variant="primary"
          size="md"
        >
          Invite Enterprise
        </Button>
      </div> */}

      <TableComponent<EnterpriseRow>
        columns={columns}
        data={sanitizedEnterprises}
        heading="Enterprise Management"
        showAddButton
        addButtonRoute="/enterprise-management/new"
        addButtonText="Invite Enterprise"
        onRowAction={handleAction}
        total={pagination?.total ?? 0}
        currentPage={currentPage}
        featureName="Enterprise Management"
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setCurrentPage(1);
          getEnterpriseList(1, size, searchQuery);
        }}
        showResetPasswordOption={true}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setCurrentPage(1);
          setSearchQuery(q);
        }}
        searchBar={
          // Only show search bar if there's data or if user is already searching
          (sanitizedEnterprises.length > 0 || searchQuery.length > 0) ? (
            <div />
          ) : null
        }
        loading={loading}
      />

      {showDeleteModal && selectedEnterprise && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete enterprise "${selectedEnterprise.enterpriseName}"?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </Layout>
  );
};

export default EnterpriseList;
