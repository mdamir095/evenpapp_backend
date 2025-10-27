import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { Button } from '../../../components/atoms/Button';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useContentPolicy } from '../hooks/useContentPolicy';
import { useContentPolicyActions } from '../hooks/useContentPolicyActions';
import { getContentPreview } from '../../../utils/htmlUtils';
import ContentViewer from '../../../components/common/ContentViewer';
import ContentPolicyForm from './ContentPolicyForm';
import { useNavigate } from 'react-router-dom';

type ContentPolicyRow = {
  id: string;
  title: string;
  contentPreview: string;
  content: string;
};

const ContentPolicyList: React.FC = () => {
  const { contentPolicies = [], pagination, loading } = useContentPolicy();
  const { getContentPolicyList, removeContentPolicy } = useContentPolicyActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContentPolicy, setSelectedContentPolicy] = useState<ContentPolicyRow | null>(null);
  const [viewingContentPolicy, setViewingContentPolicy] = useState<ContentPolicyRow | null>(null);
  const [editingContentPolicy, setEditingContentPolicy] = useState<ContentPolicyRow | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Fetch content policies when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getContentPolicyList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getContentPolicyList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleAction = useCallback((action: TableAction, row: ContentPolicyRow) => {
    switch (action) {
      case 'edit':
        navigate(`/content-policy/${row.id}`);
        // setIsFormVisible(true);
        break;
      case 'delete':
        setSelectedContentPolicy(row);
        setShowDeleteModal(true);
        break;
      case 'view':
        setViewingContentPolicy(row);
        setShowViewModal(true);
        break;
    }
  }, []);

  const handleFormSuccess = useCallback(() => {
    const wasEditing = Boolean(editingContentPolicy);
    setEditingContentPolicy(null);
    toast.success(wasEditing ? 'Content Policy updated successfully' : 'Content Policy created successfully');
  }, [editingContentPolicy, toast]);

  const handleFormCancel = useCallback(() => {
    setEditingContentPolicy(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedContentPolicy) return;
    try {
      await removeContentPolicy(selectedContentPolicy.id);
      setShowDeleteModal(false);
      setSelectedContentPolicy(null);
      toast.success('Content Policy deleted successfully');
    } catch (error) {
      // Delete content policy error
    }
  }, [selectedContentPolicy, removeContentPolicy, toast]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedContentPolicy(null);
  }, []);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setViewingContentPolicy(null);
  }, []);

  const columns: TableColumn<ContentPolicyRow>[] = useMemo(() => [
    { key: 'title', label: 'Title', width: 90, sortable: true, searchable: true },
    { key: 'contentPreview', label: 'Content Preview', width: 180 },
  ], []);

  const sanitizedContentPolicies: ContentPolicyRow[] = useMemo(() => 
    (contentPolicies as any[])?.filter(Boolean).map((cp: any) => ({
      id: (cp.id ?? cp.key ?? `${cp.title || 'policy'}-${Math.random().toString(36).slice(2,8)}`) as string,
      title: (cp.title ?? '') as string,
      contentPreview: getContentPreview(cp.content ?? '', 120),
      content: (cp.content ?? '') as string,
    })) ?? []
  , [contentPolicies]);

  return (
    <Layout>
      <>
      <div className='max-w-full'>
        <TableComponent<ContentPolicyRow>
          columns={columns}
          data={sanitizedContentPolicies}
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          currentPage={currentPage}
          featureName="Content Policy Management"
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          heading="Content Policies"
          searchBar
          searchQuery={searchQuery}
          showResetPasswordOption={false}
          onSearchChange={useCallback((q: string) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }, [])}
          onRowsPerPageChange={useCallback((size: number) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getContentPolicyList(1, size, searchQuery);
          }, [getContentPolicyList, searchQuery])}
          loading={loading}
          showAddButton   
          addButtonRoute="/content-policy/new"
          addButtonText='Add Content Policy'
        />
          {showDeleteModal && selectedContentPolicy && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete "${selectedContentPolicy.title}" content policy?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
          
          {/* View Content Modal */}
          {showViewModal && viewingContentPolicy && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{viewingContentPolicy.title}</h3>
                    <p className="text-sm text-gray-500">
                      {/* Additional metadata can be displayed here if needed */}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={closeViewModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                  <ContentViewer 
                    content={viewingContentPolicy.content}
                    className="border-0 bg-transparent p-0"
                    maxHeight="none"
                  />
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                  <Button variant="secondary" onClick={closeViewModal}>
                    Close
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      closeViewModal();
                      handleAction('edit', viewingContentPolicy);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
{/*           
          {isFormVisible ? (
            <ContentPolicyForm
              editingContentPolicy={editingContentPolicy}
              onFormSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <div className="p-8 text-gray-500 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Content Policy Form</h3>
              <p>Click "Add Content Policy" to create a new policy or click "Edit" on any policy to modify it.</p>
            </div>
          )} */}
        </div>
      </>
    </Layout>
  );
};

export default ContentPolicyList;
