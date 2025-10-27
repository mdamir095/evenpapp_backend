import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/Layout';

import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useVenue } from '../hooks/useVenue';
import { useVenueActions } from '../hooks/useVenueAction';
import ListingLocationManager from '../../../components/common/ListingLocationManager';
import api from '../../../axios';
import { Button } from '../../../components/atoms/Button';
import { X } from 'lucide-react';

const VenueList: React.FC = () => {
  const { venues = [], pagination, loading } = useVenue();
  const { getVenueList, removeVenue } = useVenueActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const toast = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationDeleteModal, setShowLocationDeleteModal] = useState(false);
  const [selectedVenueForLocation, setSelectedVenueForLocation] = useState<VenueRow | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<any>(null);
  type VenueRow = { id: string; name: string };
  const [selectedUser, setSelectedUser] = useState<VenueRow | null>(null);

  // Fetch users when page or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getVenueList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [getVenueList, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, row: VenueRow) => {
    if (action === 'edit') navigate(`/venue-management/${row.id}`);
    else if (action === 'delete') {
      setSelectedUser(row);
      setShowDeleteModal(true);
    }
    else if (action === 'add location') {
      setSelectedVenueForLocation(row);
      setShowLocationModal(true);
    }
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    removeVenue(selectedUser.id);
    setShowDeleteModal(false);
    setSelectedUser(null);
    toast.success('Venue deleted successfully');
    getVenueList(currentPage, rowsPerPage, searchQuery);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const columns: TableColumn<VenueRow>[] = [
    { key: 'name', label: 'Name', width: 300, sortable: true, searchable: true },
  ];

  const sanitizedVenues: VenueRow[] = (venues as any[])?.filter(Boolean).map((v: any) => ({
    id: (v.id ?? v.key ?? `${v.name || 'venue'}-${Math.random().toString(36).slice(2,8)}`) as string,
    name: (v.name ?? '') as string,
  })) ?? [];

  return (
    <Layout>
      <div className='max-w-3xl'>
        <TableComponent<VenueRow>
          columns={columns}
          data={sanitizedVenues}
          onRowAction={handleAction}
          total={pagination?.total ?? 0}
          currentPage={currentPage}
          uniqueId="venue_management"
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            getVenueList(1, size, searchQuery);
          }}
          heading="Venue Management"
          searchBar
          searchQuery={searchQuery}
          showAddButton
          addButtonRoute="/venue-management/new"
          addButtonText="Add Venue"
          showLocationOption={true}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          loading={loading}
        />
          {showDeleteModal && selectedUser && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${selectedUser.name} venue?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
          
          {/* Location Management Modal */}
          {showLocationModal && selectedVenueForLocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Manage Locations for {selectedVenueForLocation.name}
                    </h2>
                    <Button
                    variant='muted'
                      onClick={() => {
                        setShowLocationModal(false);
                        setSelectedVenueForLocation(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <X className='w-6 h-6' />
                    </Button>
                  </div>
                  
                  <ListingLocationManager
                    serviceId={selectedVenueForLocation.id}
                    serviceName={selectedVenueForLocation.name}
                    onLocationAdded={(location) => {
                      toast.success(`Location added to ${selectedVenueForLocation.name} successfully`);
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
      </div>
    </Layout>
  );
};

export default VenueList;
