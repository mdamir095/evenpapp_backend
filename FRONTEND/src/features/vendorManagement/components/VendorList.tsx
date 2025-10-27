import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';

import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useVendor } from '../hooks/useVendor';
import { useVendorActions } from '../hooks/useVendorActions';
import VendorForm from './VendorForm';
import ListingLocationManager from '../../../components/common/ListingLocationManager';
import api from '../../../axios';
import { Button } from '../../../components/atoms/Button';
import { X } from 'lucide-react';

// Helper component to display form data details
const FormDataPreview: React.FC<{ formData: any }> = ({ formData }) => {
  if (!formData) return <span className="text-gray-400">No data</span>;
  
  // Dynamic form with fields
  if (formData.fields && Array.isArray(formData.fields)) {
    return (
      <div className="space-y-1">
        <div className="font-medium text-sm">{formData.name}</div>
        <div className="text-xs text-gray-500">
          {formData.fields.map((field: any, index: number) => (
            <div key={field.id || index} className="flex justify-between">
              <span>{field.label || field.name}:</span>
              <span className="ml-2 max-w-20 truncate">
                {field.actualValue ? 
                  (Array.isArray(field.actualValue) ? field.actualValue.join(', ') : String(field.actualValue))
                  : 'Empty'
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Custom JSON structure
  const keys = Object.keys(formData);
  return (
    <div className="space-y-1">
      <div className="font-medium text-sm">Custom Data</div>
      <div className="text-xs text-gray-500">
        {keys.slice(0, 3).map(key => (
          <div key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className="ml-2 max-w-20 truncate">
              {typeof formData[key] === 'object' ? 'Object' : String(formData[key])}
            </span>
          </div>
        ))}
        {keys.length > 3 && <div className="text-gray-400">+{keys.length - 3} more...</div>}
      </div>
    </div>
  );
};

const VendorList: React.FC = () => {
  const { vendors, pagination, loading } = useVendor();
  const { getVendorList, removeVendor } = useVendorActions();
  
  // Ensure vendors is always an array
  const vendorList = Array.isArray(vendors) ? vendors : [];
  
  // Debug log removed

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationDeleteModal, setShowLocationDeleteModal] = useState(false);
  const [selectedVendorForLocation, setSelectedVendorForLocation] = useState<VendorRow | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<any>(null);
  type VendorRow = { id: string; name: string; description?: string };
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);

  // Fetch vendors when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getVendorList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getVendorList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, vendor: VendorRow) => {
    if (action === 'edit') navigate(`/vendor-management/${vendor.id}`);
    else if (action === 'delete') {
      setSelectedVendor(vendor);
      setShowDeleteModal(true);
    }
    else if (action === 'add location') {
      setSelectedVendorForLocation(vendor);
      setShowLocationModal(true);
    }
    // ignore other actions for vendors
  };

  const confirmDelete = () => {
    if (!selectedVendor) return;
    removeVendor(selectedVendor.id);
    setShowDeleteModal(false);
    setSelectedVendor(null);
    toast.success('Vendor deleted successfully');
    getVendorList(currentPage, rowsPerPage, searchQuery);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedVendor(null);
  };

  const columns: TableColumn<VendorRow>[] = [
    { key: 'name', label: 'Title', width: 250, sortable: true, searchable: true },
    { key: 'description', label: 'Description', width: 300 },
  ];

  const sanitizedVendors: VendorRow[] = vendorList
    ?.filter(Boolean)
    .map((v: any) => ({
      id: (v.id ?? v.key ?? `${v.name || 'vendor'}-${Math.random().toString(36).slice(2,8)}`) as string,
      name: (v.name ?? '') as string,
      description: (v.description ?? v.details ?? undefined) as string | undefined,
    })) ?? [];

  return (
    <Layout>
      <>
      <div className='max-w-3xl'>
        <TableComponent<VendorRow>
          columns={columns}
          data={sanitizedVendors}
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          currentPage={currentPage}
          featureName="Vendor Management"
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getVendorList(1, size, searchQuery);
          }}
          heading="Vendor Management"
          searchBar
          searchQuery={searchQuery}
          showResetPasswordOption={false}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          loading={loading}
          showAddButton
          addButtonRoute="/vendor-management/new"
          addButtonText='Add Vendor'
          showLocationOption={true}
        />
          {showDeleteModal && selectedVendor && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${selectedVendor.name} vendor?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
          
          {/* Location Management Modal */}
          {showLocationModal && selectedVendorForLocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Manage Locations for {selectedVendorForLocation.name}
                    </h2>
                    <Button
                      variant='muted'
                      onClick={() => {
                        setShowLocationModal(false);
                        setSelectedVendorForLocation(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                       <X className='w-6 h-6' />
                    </Button>
                  </div>
                  
                  <ListingLocationManager
                    serviceId={selectedVendorForLocation.id}
                    serviceName={selectedVendorForLocation.name}
                    onLocationAdded={(location) => {
                      toast.success(`Location added to ${selectedVendorForLocation.name} successfully`);
                    }}
                                         onDeleteLocation={(location) => {
                       setLocationToDelete(location);
                       setShowLocationDeleteModal(true);
                       setShowLocationModal(false); // Hide the location listing modal
                     }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location Delete Confirmation Modal */}
          {showLocationDeleteModal && locationToDelete && (
            <ConfirmModal
              isOpen={showLocationDeleteModal}
                             onClose={() => {
                 setShowLocationDeleteModal(false);
                 setLocationToDelete(null);
                 setShowLocationModal(true); // Show the location listing modal again
               }}
              onConfirm={async () => {
                try {
                  await api.delete(`/location/${locationToDelete.id}`);
                  toast.success('Location deleted successfully!');
                  setShowLocationDeleteModal(false);
                  setLocationToDelete(null);
                  // Refresh the location list by re-rendering the modal
                  setShowLocationModal(false);
                  setTimeout(() => setShowLocationModal(true), 100);
                } catch (error: any) {
                  console.error('Error deleting location:', error);
                  toast.error(error.response?.data?.message || 'Failed to delete location');
                }
              }}
              title="Confirm Location Deletion"
              message={`Are you sure you want to delete the location "${locationToDelete.name || locationToDelete.address || 'Unnamed Location'}"? This action cannot be undone.`}
              confirmLabel="Delete Location"
              cancelLabel="Cancel"
            />
          )}
          
          {/* <VendorForm/> */}
         </div>
      </>
    </Layout>
  );
};

export default VendorList;
