import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useEnterprise() {
  return useSelector(
    (state: RootState) => ({
      enterprises: state.enterprises.enterprises, 
      selectedEnterprise: state.enterprises.selectedEnterprise,
      loading: state.enterprises.loading,
      error: state.enterprises.error,
      pagination: state.enterprises.pagination,
      features: state.enterprises.features ?? [],
    }),
    shallowEqual
  );
}
