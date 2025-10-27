import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Loader2, CheckCircle, AlertCircle, MapPin, Globe } from 'lucide-react';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface LocationFieldProps {
  value?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (location: {
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  showCoordinates?: boolean;
}

const LocationField: React.FC<LocationFieldProps> = ({
  value = {},
  onChange,
  label = 'Location',
  required = false,
  error,
  className = '',
  showCoordinates = true,
}) => {
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  // Handle place selection from Google Places Autocomplete
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    setGeocodingStatus('loading');

    // Set coordinates
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (place.geometry?.location) {
      latitude = place.geometry.location.lat();
      longitude = place.geometry.location.lng();
      setGeocodingStatus('success');
    } else {
      setGeocodingStatus('error');
    }

    // Update the parent component
    onChange({
      address: place.formatted_address || '',
      latitude,
      longitude,
    });
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

  const getGeocodingStatusMessage = () => {
    if (geocodingStatus === 'success' && value.latitude && value.longitude) {
      return (
        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Location Found!</span>
          </div>
          <p className="text-green-700">Latitude: {value.latitude.toFixed(6)}</p>
          <p className="text-green-700">Longitude: {value.longitude.toFixed(6)}</p>
          {selectedPlace?.formatted_address && (
            <p className="text-green-700 mt-1">
              <strong>Address:</strong> {selectedPlace.formatted_address}
            </p>
          )}
        </div>
      );
    }
    if (geocodingStatus === 'error') {
      return (
        <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-800">Location Not Found</span>
          </div>
          <p className="text-red-700">
            Please try a different location.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="flex items-center space-x-2">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          {getGeocodingIcon()}
        </Label>
      </div>

      {/* Google Places Autocomplete */}
      <div>
        <GooglePlacesAutocomplete
          value={value.address || ''}
          onChange={(address) => onChange({ ...value, address })}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search for a location..."
          error={error}
        />
      </div>



      {/* Geocoding Status */}
      {getGeocodingStatusMessage()}

      {/* Coordinates Display (Read-only) */}
      {showCoordinates && (
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
                value={value.latitude || ''}
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
                value={value.longitude || ''}
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
      )}
    </div>
  );
};

export default LocationField;
