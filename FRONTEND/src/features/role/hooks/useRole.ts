import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useRole() {
  return useSelector(
    (state: RootState) => ({
      roles: state.roles.roles,
      selectedRole: state.roles.selectedRole,
      loading: state.roles.loading, // For list fetching (skeleton)
      formLoading: state.roles.formLoading, // For form operations
      error: state.roles.error,
      features: state.roles.features,   
      featuresLoading: state.roles.featuresLoading,
      pagination: state.roles.pagination,
    }),
    shallowEqual
  );
}
