import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useUser() {
  return useSelector(
    (state: RootState) => ({
      users: state.users.users,
      selectedUser: state.users.selectedUser,
      loading: state.users.loading,
      formLoading: state.users.formLoading, // ✅ Added formLoading
      error: state.users.error,
      pagination: state.users.pagination,
      roles: state.users.roles ?? [],
      features: state.users.features ?? [], // ✅ Added features
    }),
    shallowEqual
  );
}
