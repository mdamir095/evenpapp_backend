import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { SelectGroup } from '../molecules/SelectGroup';
import { Button } from '../atoms/Button';
import { MapPin, Navigation } from 'lucide-react';
import { indianStates, getCitiesForState, getPincodesForCity } from '../../data/indianStatesAndPincodes';

export interface AddressData {
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

interface AddressComponentProps {
  value?: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Partial<Record<keyof AddressData, string>>;
  required?: boolean;
  showLocationOption?: boolean;
  className?: string;
  label?: string;
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  value = {
    address1: '',
    address2: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    latitude: undefined,
    longitude: undefined,
    fullAddress: ''
  },
  onChange,
  errors = {},
  required = false,
  showLocationOption = true,
  className = '',
  label = 'Address'
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(value.state || '');
  const [selectedCity, setSelectedCity] = useState(value.city || '');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Get available cities based on selected state
  useEffect(() => {
    if (selectedState) {
      const cities = getCitiesForState(selectedState);
      const cityNames = cities.map(city => city.value);
      setAvailableCities(cityNames);
      
      // Reset city if it's not available in the new state
      if (value.city && !cityNames.includes(value.city)) {
        setSelectedCity('');
        handleAddressChange('city', '');
      }
    } else {
      setAvailableCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  // Initialize state and city from value
  useEffect(() => {
    if (value.state) {
      setSelectedState(value.state);
    }
    if (value.city) {
      setSelectedCity(value.city);
    }
  }, [value.state, value.city]);

  const handleAddressChange = (field: keyof AddressData, newValue: string | number) => {
    const updatedAddress = {
      ...value,
      [field]: newValue
    };

    // Auto-generate full address
    const fullAddress = generateFullAddress(updatedAddress);
    updatedAddress.fullAddress = fullAddress;

    onChange(updatedAddress);
  };

  const generateFullAddress = (address: AddressData): string => {
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.state,
      address.pincode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  // Location selection handler - to be implemented with map integration
  // const handleLocationSelect = (lat: number, lng: number, address: string) => {
  //   handleAddressChange('latitude', lat);
  //   handleAddressChange('longitude', lng);
  //   handleAddressChange('fullAddress', address);
  //   setIsLocationModalOpen(false);
  // };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const getStateOptions = () => {
    return indianStates.map(state => ({
      label: state.label,
      value: state.value
    }));
  };

  const getCityOptions = () => {
    return availableCities.map(city => ({
      label: city,
      value: city
    }));
  };

  const getPincodeOptions = () => {
    if (selectedState && selectedCity) {
      return getPincodesForCity(selectedState, selectedCity);
    }
    return [];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {showLocationOption && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openLocationModal}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Use Location
          </Button>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 {required && <span className="text-red-500">*</span>}
        </label>
        <Input
          type="text"
          placeholder="Enter address line 1"
          value={value.address1}
          onChange={(e) => handleAddressChange('address1', e.target.value)}
          error={errors.address1}
          className="w-full"
        />
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <Input
          type="text"
          placeholder="Enter address line 2 (optional)"
          value={value.address2}
          onChange={(e) => handleAddressChange('address2', e.target.value)}
          error={errors.address2}
          className="w-full"
        />
      </div>

      {/* Country, State, City Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="text"
            placeholder="Country"
            value={value.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            error={errors.country}
            className="w-full"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <SelectGroup
            label=""
            options={getStateOptions()}
            value={selectedState ? [{ label: selectedState, value: selectedState }] : []}
            onChange={(selected) => {
              const state = selected[0]?.value || '';
              setSelectedState(state);
              handleAddressChange('state', state);
            }}
            isMulti={false}
            error={errors.state}
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <SelectGroup
            label=""
            options={getCityOptions()}
            value={selectedCity ? [{ label: selectedCity, value: selectedCity }] : []}
            onChange={(selected) => {
              const city = selected[0]?.value || '';
              setSelectedCity(city);
              handleAddressChange('city', city);
            }}
            isMulti={false}
            error={errors.city}
          />
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pincode {required && <span className="text-red-500">*</span>}
        </label>
        <SelectGroup
          label=""
          options={getPincodeOptions()}
          value={value.pincode ? [{ label: value.pincode, value: value.pincode }] : []}
          onChange={(selected) => {
            const pincode = selected[0]?.value || '';
            handleAddressChange('pincode', pincode);
          }}
          isMulti={false}
          error={errors.pincode}
        />
      </div>

      {/* Full Address Display */}
      {value.fullAddress && (
        <div className="p-3 bg-gray-50 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complete Address
          </label>
          <p className="text-sm text-gray-600">{value.fullAddress}</p>
        </div>
      )}

      {/* Location Coordinates Display */}
      {(value.latitude && value.longitude) && (
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Location Coordinates</span>
          </div>
          <p className="text-sm text-blue-600">
            Lat: {value.latitude.toFixed(6)}, Lng: {value.longitude.toFixed(6)}
          </p>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Location</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsLocationModalOpen(false)}
              >
                Close
              </Button>
            </div>
            <div className="h-80 border rounded-md">
              {/* Location picker component would go here */}
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Location picker component</p>
                  <p className="text-sm">(Integrate with your map component)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressComponent;
