import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import GooglePlacesAutocomplete from '../common/GooglePlacesAutocomplete';
import LocationModalWithAutocomplete from '../common/LocationModalWithAutocomplete';

const LocationSearchDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    console.log('Selected place:', place);
  };

  const handleSaveLocation = async (locationData: any) => {
    console.log('Saving location:', locationData);
    // Here you would typically save to your backend
    alert('Location saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Google Places Autocomplete Demo
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This demo showcases how to use Google Places Autocomplete for location search without requiring manual state/city entry.
          Users can simply start typing and get location suggestions from Google's database.
        </p>
      </div>

      {/* Simple Search Demo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Simple Location Search</h2>
        <div className="max-w-md">
          <GooglePlacesAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search for a location..."
            label="Location Search"
          />
        </div>
        
        {selectedPlace && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Selected Location:</h3>
            <p className="text-green-700">
              <strong>Name:</strong> {selectedPlace.name || 'N/A'}
            </p>
            <p className="text-green-700">
              <strong>Address:</strong> {selectedPlace.formatted_address || 'N/A'}
            </p>
            {selectedPlace.geometry?.location && (
              <>
                <p className="text-green-700">
                  <strong>Latitude:</strong> {selectedPlace.geometry.location.lat().toFixed(6)}
                </p>
                <p className="text-green-700">
                  <strong>Longitude:</strong> {selectedPlace.geometry.location.lng().toFixed(6)}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Full Modal Demo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Full Location Modal with Autocomplete</h2>
        <p className="text-gray-600 mb-4">
          This opens a complete location modal with Google Places Autocomplete integration.
        </p>
        <Button onClick={() => setIsModalOpen(true)}>
          Open Location Modal
        </Button>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">No Manual State/City Entry</h3>
                <p className="text-sm text-gray-600">Users don't need to manually select state and city from dropdowns</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Real-time Suggestions</h3>
                <p className="text-sm text-gray-600">Get location suggestions as you type</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Auto-filled Details</h3>
                <p className="text-sm text-gray-600">City, state, and PIN code are automatically filled</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Accurate Coordinates</h3>
                <p className="text-sm text-gray-600">Precise latitude and longitude from Google's database</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Keyboard Navigation</h3>
                <p className="text-sm text-gray-600">Use arrow keys and Enter to navigate suggestions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Fallback to Manual Entry</h3>
                <p className="text-sm text-gray-600">Option to enter details manually if needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Setup Requirements</h2>
        <div className="space-y-3 text-blue-800">
          <p>✅ <strong>Google Maps API Key:</strong> Configured in environment variables</p>
          <p>✅ <strong>Places API:</strong> Enabled in Google Cloud Console</p>
          <p>✅ <strong>@react-google-maps/api:</strong> Already installed</p>
          <p>✅ <strong>TypeScript Types:</strong> Google Maps types available</p>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Make sure you have a valid Google Maps API key with Places API enabled. 
            See <code className="bg-blue-200 px-1 rounded">GOOGLE_MAPS_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      </div>

      {/* Location Modal */}
      <LocationModalWithAutocomplete
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
        title="Add New Location"
      />
    </div>
  );
};

export default LocationSearchDemo;
