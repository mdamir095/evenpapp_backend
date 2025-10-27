import { useState, useCallback } from 'react';

// Initialize react-geocode
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AKIA52JBVXHFBSPG4DFI';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

interface UseGeocodingReturn {
  geocodeAddress: (addressData: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => Promise<GeocodingResult | null>;
  isLoading: boolean;
  error: string | null;
}

// No static fallback coordinates - we'll rely on the actual API

export const useGeocoding = (): UseGeocodingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = useCallback(async (addressData: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Build the address string from components
      const addressComponents = [
        addressData.address,
        addressData.city,
        addressData.state,
        addressData.pincode
      ].filter(Boolean);

      if (addressComponents.length === 0) {
        setError('No address components provided');
        return null;
      }

      const addressString = addressComponents.join(', ');
      
      // Check if API key is configured
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        setError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
        return null;
      }
      
      // Use Google Maps Geocoding API directly
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${GOOGLE_MAPS_API_KEY}&region=in`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;
        
        // Extract address components for auto-filling
        let city = '';
        let state = '';
        let country = '';
        
        if (data.results[0].address_components) {
          for (const component of data.results[0].address_components) {
            if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          }
        }
        
        return {
          latitude: lat,
          longitude: lng,
          formattedAddress,
          city,
          state,
          country
        };
      } else if (data.status === 'REQUEST_DENIED') {
        // API key is invalid
        setError('Google Maps API key is invalid. Please check your API key configuration.');
        return null;
      } else {
        setError(`Geocoding failed: ${data.status}`);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Geocoding failed';
      setError(errorMessage);
      console.error('Geocoding error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    geocodeAddress,
    isLoading,
    error
  };
};
