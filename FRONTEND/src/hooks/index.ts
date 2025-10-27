import { useAppSelector } from '../store';

export function useAuth() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated;
}
