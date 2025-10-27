import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useAuth() {
  return useSelector((state: RootState) => state.auth);
}
