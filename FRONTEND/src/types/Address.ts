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

export interface AddressComponentProps {
  value?: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Partial<Record<keyof AddressData, string>>;
  required?: boolean;
  showLocationOption?: boolean;
  className?: string;
  label?: string;
}
