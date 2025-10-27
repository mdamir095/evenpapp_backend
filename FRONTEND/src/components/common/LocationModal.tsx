import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../ui/label';
import { Dropdown } from '../ui/dropdown';
import type { DropdownOption } from '../ui/dropdown';
import { Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { useGeocoding } from '../../hooks/useGeocoding';
import { indianStates, getCitiesForState, getPincodesForCity } from '../../data/indianStatesAndPincodes';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: any) => void;
  initialData?: any;
  title?: string;
}

interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Add Location',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<DropdownOption[]>([]);
  const [pincodeOptions, setPincodeOptions] = useState<DropdownOption[]>([]);

  const { geocodeAddress, isLoading: geocodingLoading, error: geocodingError } = useGeocoding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    defaultValues: initialData || {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  // Convert states to dropdown options
  const stateOptions: DropdownOption[] = indianStates.map(state => ({
    value: state.value,
    label: state.label
  }));

  // Handle state selection
  const handleStateChange = (stateValue: string) => {
    setSelectedState(stateValue);
    setSelectedCity('');
    setValue('state', indianStates.find(s => s.value === stateValue)?.label || '');
    setValue('city', '');
    setValue('pincode', '');
    
    const newCityOptions = getCitiesForState(stateValue);
    setCityOptions(newCityOptions);
    setPincodeOptions([]);
  };

  // Handle city selection
  const handleCityChange = (cityValue: string) => {
    setSelectedCity(cityValue);
    setValue('city', cityOptions.find(c => c.value === cityValue)?.label || '');
    setValue('pincode', '');
    
    const newPincodeOptions = getPincodesForCity(selectedState, cityValue);
    setPincodeOptions(newPincodeOptions);
  };

  // Handle PIN code selection
  const handlePincodeChange = (pincodeValue: string) => {
    setValue('pincode', pincodeValue);
  };

  const watchedAddress = watch(['address', 'city', 'state', 'pincode']);

  // Auto-geocode when address fields change
  useEffect(() => {
    const addressFields = watchedAddress.filter(Boolean);
    if (addressFields.length >= 2) {
      const timeoutId = setTimeout(handleGeocode, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [watchedAddress]);

  // Special handling for PIN code only geocoding
  useEffect(() => {
    const pincode = watch('pincode');
    const city = watch('city');
    const state = watch('state');
    
    if (pincode && pincode.length >= 6 && (!city || !state)) {
      const timeoutId = setTimeout(handleGeocode, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [watch('pincode')]);

  const handleGeocode = async () => {
    const addressData = {
      address: watch('address'),
      city: watch('city'),
      state: watch('state'),
      pincode: watch('pincode'),
    };

    const hasAddressData = Object.values(addressData).some(Boolean);
    if (!hasAddressData) return;

    setGeocodingStatus('loading');
    
    const result = await geocodeAddress(addressData);
    
    if (result) {
      console.log('Geocoding result:', result);
      setValue('latitude', result.latitude);
      setValue('longitude', result.longitude);
      setCoordinates({ lat: result.latitude, lng: result.longitude });
      
      // Auto-fill city and state if they're empty
      if (result.city && (!addressData.city || addressData.city.trim() === '')) {
        setValue('city', result.city);
      }
      if (result.state && (!addressData.state || addressData.state.trim() === '')) {
        setValue('state', result.state);
      }
      
      setGeocodingStatus('success');
    } else {
      setGeocodingStatus('error');
    }
  };

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGeocodingIcon = () => {
    if (geocodingLoading || geocodingStatus === 'loading') {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (geocodingStatus === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (geocodingStatus === 'error' || geocodingError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <MapPin className="w-4 h-4 text-gray-400" />;
  };

  const getGeocodingStatusMessage = () => {
    if (geocodingStatus === 'success' && coordinates) {
      return (
        <div className="text-sm text-gray-600">
          <p>Latitude: {coordinates.lat.toFixed(6)}</p>
          <p>Longitude: {coordinates.lng.toFixed(6)}</p>
        </div>
      );
    }
    if (geocodingError) {
      return (
        <div className="text-sm">
          <p className="text-red-600 font-medium">❌ {geocodingError}</p>
          <p className="text-gray-600 text-xs mt-1">
            Please check your Google Maps API key configuration. See GOOGLE_MAPS_SETUP.md for instructions.
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button
              onClick={onClose}
              variant="muted"
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-black"
            >
              ✕
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Location Name */}
          <div>
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Location name is required' })}
              error={errors.name?.message}
              placeholder="Enter location name"
            />
          </div>

          {/* Address Field */}
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              {...register('address', { required: 'Address is required' })}
              error={errors.address?.message}
              placeholder="Enter complete address"
            />
          </div>

          {/* Cascading Dropdowns: State → City → PIN Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Dropdown
                options={stateOptions}
                value={selectedState}
                onChange={handleStateChange}
                placeholder="Select State"
                label="State *"
                error={errors.state?.message}
                searchable={true}
              />
            </div>
            <div>
              <Dropdown
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder="Select City"
                label="City *"
                error={errors.city?.message}
                disabled={!selectedState}
                searchable={true}
              />
            </div>
            <div>
              <Dropdown
                options={pincodeOptions}
                value={watch('pincode')}
                onChange={handlePincodeChange}
                placeholder="Select PIN Code"
                label="PIN Code *"
                error={errors.pincode?.message}
                disabled={!selectedCity}
                searchable={true}
              />
            </div>
          </div>

          {/* Manual Coordinate Input */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register('latitude', {
                    valueAsNumber: true,
                    min: { value: -90, message: 'Latitude must be between -90 and 90' },
                    max: { value: 90, message: 'Latitude must be between -90 and 90' },
                  })}
                  error={errors.latitude?.message}
                  placeholder="Enter latitude (e.g., 19.0760)"
                  className={geocodingStatus === 'success' ? 'border-green-300 bg-green-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="longitude">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register('longitude', {
                    valueAsNumber: true,
                    min: { value: -180, message: 'Longitude must be between -180 and 180' },
                    max: { value: 180, message: 'Longitude must be between -180 and 180' },
                  })}
                  error={errors.longitude?.message}
                  placeholder="Enter longitude (e.g., 72.8777)"
                  className={geocodingStatus === 'success' ? 'border-green-300 bg-green-50' : ''}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="muted"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Save Location
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
