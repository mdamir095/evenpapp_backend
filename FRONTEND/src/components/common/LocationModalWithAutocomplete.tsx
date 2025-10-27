import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../ui/label';
import { Loader2, CheckCircle, AlertCircle, MapPin, Globe, X } from 'lucide-react';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: any) => void;
  initialData?: any;
  title?: string;
  isEmbedded?: boolean;
}

interface LocationFormData {
  address: string;
  latitude?: number;
  longitude?: number;
}

const LocationModalWithAutocomplete: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Add Location',
  isEmbedded = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    defaultValues: initialData || {
      address: '',
    },
  });

  // Handle place selection from Google Places Autocomplete
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    setGeocodingStatus('loading');

    // Set form values
    if (place.formatted_address) {
      setValue('address', place.formatted_address);
    }

    // Set coordinates
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setValue('latitude', lat);
      setValue('longitude', lng);
      setCoordinates({ lat, lng });
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
      setSelectedPlace(null);
      setCoordinates(null);
      setGeocodingStatus('idle');
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGeocodingIcon = () => {
    if (geocodingStatus === 'loading') {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (geocodingStatus === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (geocodingStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <MapPin className="w-4 h-4 text-gray-400" />;
  };



  if (!isOpen) return null;

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Search Location */}
          <div>
            <Label>Search Location *</Label>
            <GooglePlacesAutocomplete
              value={watch('address')}
              onChange={(value) => setValue('address', value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Start typing to search for a location..."
              error={errors.address?.message}
            />
          </div>



          {/* Coordinates Display (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <span>Coordinates</span>
              {getGeocodingIcon()}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
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
                  placeholder="Auto-populated from location search"
                  className={`${geocodingStatus === 'success' ? 'border-green-300 bg-green-50' : ''} bg-gray-50`}
                  disabled={true}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
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
                  placeholder="Auto-populated from location search"
                  className={`${geocodingStatus === 'success' ? 'border-green-300 bg-green-50' : ''} bg-gray-50`}
                  disabled={true}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates are automatically populated when you select a location from the search above.
            </p>
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
      );

  // If embedded, return just the form content
  if (isEmbedded) {
    return formContent;
  }

  // Otherwise, return the full modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button
              onClick={onClose}
              variant="muted"
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-black cursor-pointer"
            >
              <X className='w-6 h-6' />
            </Button>
          </div>
        </div>
        <div className="p-6">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default LocationModalWithAutocomplete;
