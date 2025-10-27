import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { useToast } from '../atoms/Toast';
import LocationModalWithAutocomplete from './LocationModalWithAutocomplete';

import api from '../../axios';
import { MapPin } from 'lucide-react';

interface ListingLocationManagerProps {
  serviceId: string;
  serviceName: string;
  onLocationAdded?: (location: any) => void;
  onDeleteLocation?: (location: any) => void;
  className?: string;
}

interface Location {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  key: string;
  isActive: boolean;
  isDeleted: boolean;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceId: string;
  // Optional fields that might not be present in the response
  name?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const ListingLocationManager: React.FC<ListingLocationManagerProps> = ({
  serviceId,
  serviceName,
  onLocationAdded,
  onDeleteLocation,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  // Fetch locations for this service
  const fetchLocations = async (page = currentPage, pageLimit = limit) => {
    try {
      const response = await api.get(`/location?serviceId=${serviceId}&page=${page}&limit=${pageLimit}`);
      // Handle nested data structure: response.data.data.data
      const locationsData = response.data?.data?.data || [];
      setLocations(locationsData);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    }
  };

  // Fetch locations on component mount
  React.useEffect(() => {
    fetchLocations();
  }, [serviceId]);

  const handleSaveLocation = async (locationData: any) => {
    setIsLoading(true);
    try {
      // Prepare location data for the API
      const locationWithServiceId = {
        ...locationData,
        serviceId: serviceId,
        // Don't set name here - let the backend generate it from address
        isActive: true,
      };

      // Save to database
      const response = await api.post('/location', locationWithServiceId);
      const savedLocation = response.data;

      // Fetch updated locations list with current pagination
      await fetchLocations(currentPage, limit);

      // Notify parent component
      if (onLocationAdded) {
        onLocationAdded(savedLocation);
      }

      setShowAddForm(false); // Hide the add form and show the listing
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.message || 'Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (location: Location) => {
    if (onDeleteLocation) {
      onDeleteLocation(location);
    }
  };



  const toggleView = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Service Locations</h3>
          <p className="text-sm text-gray-600">
            {showAddForm 
              ? `Add new location for ${serviceName.toLowerCase()}`
              : `Manage locations for ${serviceName.toLowerCase()} service`
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={toggleView}
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            {showAddForm ? (
              <>
                <span>View Locations</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Add Location</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add Location Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <button className="text-lg font-medium text-gray-900 mb-2">Add New Location</button>
            <p className="text-sm text-gray-600">Search and select a location to add to this service.</p>
          </div>
          
          <LocationModalWithAutocomplete
            isOpen={true}
            onClose={() => setShowAddForm(false)}
            onSave={handleSaveLocation}
            title={`Add Location for ${serviceName}`}
            isEmbedded={true}
          />
        </div>
      )}

      {/* Locations List */}
      {!showAddForm && (
        <>
          {locations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Current Locations:</h4>
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {location.name || location.address || 'Unnamed Location'}
                      </h5>
                      {location.address && location.name && (
                        <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {location.city && <span>{location.city}</span>}
                        {location.state && <span>{location.state}</span>}
                        {location.pincode && <span>{location.pincode}</span>}
                      </div>
                      {location.latitude && location.longitude && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(location.createdAt).toLocaleDateString()}</span>
                        {location.isActive && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="muted"
                      size="sm"
                      onClick={() => handleDeleteClick(location)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {locations.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-gray-400 mb-2">
              <MapPin className="w-12 h-12 m-auto" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No locations added</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add locations where this service is available to help customers find you.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                disabled={isLoading}
                variant="primary"
                size="sm"
              >
                Add First Location
              </Button>
            </div>
          )}
        </>
      )}

      
    </div>
  );
};

export default ListingLocationManager;
