import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useVendor() {
  return useSelector((state: RootState) => state.vendor);
}
