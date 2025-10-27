import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import { useFeatureActions } from '../hooks/useFeatureActions';
import { useFeature } from '../hooks/useFeature';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { useToast } from '../../../components/atoms/Toast';

import FeatureForm from './FeatureForm';
import { useNavigate } from 'react-router-dom';

const FeatureList: React.FC = () => {
  const { features = [], pagination, loading, error } = useFeature();
  const { getFeatureList } = useFeatureActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();
  const navigate = useNavigate();
  
  type FeatureRow = { id: string; name: string };

  // State for inline editing
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(true); // Default to true - form open by default

  // Fetch users when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getFeatureList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getFeatureList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, feature: FeatureRow) => {
    if (action === 'edit') {
      navigate(`/feature-management/${feature.id}`);
      setEditingFeature(feature);
      setIsFormVisible(true);
    }
    else if (action === 'view') {
      // View functionality can be added here if needed
    }
    // Delete functionality removed - features cannot be deleted
  };



  const handleFormSuccess = () => {
    const wasEditing = Boolean(editingFeature);
    setEditingFeature(null);
    // No need to refresh the list as Redux actions already update the state
    toast.success(wasEditing ? 'Feature updated successfully' : 'Feature created successfully');
  };

  const handleFormCancel = () => {
    setEditingFeature(null);
    // Keep form visible since it should always be open
  };

  // Delete functionality removed - features cannot be deleted

  const columns: TableColumn<FeatureRow>[] = [
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
        <TableComponent<FeatureRow>
          columns={columns}
          data={features?.filter(Boolean) ?? []}
          heading="Feature Management"
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getFeatureList(1, size, searchQuery);
          }}
          searchBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          loading={loading}
          showAddButton   
          addButtonRoute="/feature-management/new"
          addButtonText='Add Feature'
          featureName="Feature Management"
          hideDeleteAction={true}
        />

          {/* {isFormVisible ? (
            <FeatureForm
              editingFeature={editingFeature}
              onFormSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <div className="p-8 text-gray-500 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Feature Form</h3>
              <p>Click "Add Feature" to create a new feature or click "Edit" on any feature to modify it.</p>
            </div>
          )} */}
        </div>
      </>
    </Layout>
  );
};

export default FeatureList;
