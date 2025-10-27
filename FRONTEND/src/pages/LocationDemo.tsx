import React, { useState } from 'react';
import { Button } from '../components/atoms/Button';
import { useToast } from '../components/atoms/Toast';
import GooglePlacesAutocomplete from '../components/common/GooglePlacesAutocomplete';
import LocationModalWithAutocomplete from '../components/common/LocationModalWithAutocomplete';
import LocationField from '../components/common/LocationField';
import ListingLocationManager from '../components/common/ListingLocationManager';
import Layout from '../layouts/Layout';

const LocationDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationFieldValue, setLocationFieldValue] = useState<any>({});
  const [demoVendorId] = useState('demo-vendor-123');
  const toast = useToast();

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    console.log('Selected place:', place);
  };

  const handleSaveLocation = async (locationData: any) => {
    console.log('Saving location:', locationData);
    toast.success('Location saved successfully!');
  };

  const handleLocationFieldChange = (location: any) => {
    setLocationFieldValue(location);
    console.log('Location field changed:', location);
  };

  const handleLocationAdded = (location: any) => {
    console.log('Location added to listing:', location);
    toast.success('Location added to listing successfully!');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Location Management Demo
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            This demo showcases the complete location management system with Google Places Autocomplete integration.
            Users can add locations to vendors and listings without manually entering state/city information.
          </p>
        </div>

        {/* Simple Autocomplete Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">1. Simple Location Search</h2>
          <p className="text-gray-600 mb-4">
            Basic Google Places Autocomplete component for location search.
          </p>
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

        {/* Location Field Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">2. Location Field Component</h2>
          <p className="text-gray-600 mb-4">
            Reusable location field component that can be integrated into any form.
          </p>
          <div className="max-w-2xl">
            <LocationField
              value={locationFieldValue}
              onChange={handleLocationFieldChange}
              label="Business Location"
              required={true}
              showCoordinates={true}
            />
          </div>
          
          {Object.keys(locationFieldValue).length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Location Field Value:</h3>
              <pre className="text-blue-700 text-sm overflow-auto">
                {JSON.stringify(locationFieldValue, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Full Modal Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">3. Full Location Modal</h2>
          <p className="text-gray-600 mb-4">
            Complete location modal with Google Places Autocomplete and manual entry options.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Location Modal
          </Button>
        </div>

        {/* Vendor Location Management Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">4. Vendor Location Management</h2>
          <p className="text-gray-600 mb-4">
            Add multiple locations to a vendor service with automatic database storage.
          </p>
          <ListingLocationManager
            serviceId={demoVendorId}
            serviceName="Demo Photography Service"
            onLocationAdded={handleLocationAdded}
          />
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium">No Manual State/City Entry</h3>
                  <p className="text-sm text-gray-600">Users don't need to navigate through dropdown menus</p>
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
                  <h3 className="font-medium">Database Integration</h3>
                  <p className="text-sm text-gray-600">Locations are automatically saved to the database</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium">Multiple Locations</h3>
                  <p className="text-sm text-gray-600">Add multiple locations per vendor/listing</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
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
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium">Visual Feedback</h3>
                  <p className="text-sm text-gray-600">Clear status indicators and error handling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">Implementation Guide</h2>
          <div className="space-y-4 text-blue-800">
            <div>
              <h3 className="font-medium mb-2">1. For Vendor Forms:</h3>
              <p className="text-sm">Use <code className="bg-blue-100 px-1 rounded">VendorFormWithLocation</code> component which includes location field support.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. For Dynamic Forms:</h3>
              <p className="text-sm">Add a field with <code className="bg-blue-100 px-1 rounded">type: 'location'</code> to your dynamic form configuration.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. For Listings:</h3>
              <p className="text-sm">Use <code className="bg-blue-100 px-1 rounded">ListingLocationManager</code> component to manage multiple locations.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">4. Standalone Usage:</h3>
              <p className="text-sm">Use <code className="bg-blue-100 px-1 rounded">LocationField</code> or <code className="bg-blue-100 px-1 rounded">GooglePlacesAutocomplete</code> for custom implementations.</p>
            </div>
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
    </Layout>
  );
};

export default LocationDemo;
