import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import LocationModal from '../common/LocationModal';
import { api } from '../../axios/globalApi';
import { toast } from 'react-hot-toast';

const LocationModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveLocation = async (locationData: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/location', locationData);
      toast.success('Location saved successfully!');
      console.log('Saved location:', response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save location');
      console.error('Error saving location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Location Modal Example</h1>
          <p className="text-gray-600 mb-6">
            This example demonstrates the simplified location modal with automatic geocoding.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Features:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Simplified address fields: Address, City, State, PIN Code</li>
              <li>• Automatic geocoding when address fields change</li>
              <li>• Manual geocoding button</li>
              <li>• Manual coordinate input with validation</li>
              <li>• Real-time geocoding status indicators</li>
            </ul>
          </div>

          <Button onClick={handleOpenModal} loading={isLoading}>
            Add New Location
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Form Structure:</h2>
          <div className="bg-white p-4 rounded border">
            <pre className="text-sm text-gray-700">
{`{
  "name": "string",
  "address": "string", 
  "city": "string",
  "state": "string",
  "pincode": "string",
  "latitude": 0,
  "longitude": 0,
  "serviceId": "string"
}`}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">API Endpoints:</h3>
          <ul className="text-green-700 space-y-1 font-mono text-sm">
                    <li>POST /api/v1/location/geocode - Geocode address to coordinates</li>
        <li>POST /api/v1/location - Create new location</li>
        <li>GET /api/v1/location/nearby/search - Find nearby locations</li>
          </ul>
        </div>
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
        title="Add New Location"
      />
    </div>
  );
};

export default LocationModalExample;
