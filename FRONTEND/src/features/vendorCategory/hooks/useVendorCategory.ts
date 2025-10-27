import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useVendorCategory() {
  return useSelector(
    (state: RootState) => ({
      vendorCategories: state.vendorCategories.vendorCategories,
      selectedVendorCategory: state.vendorCategories.selectedVendorCategory,
      loading: state.vendorCategories.loading, // For list fetching (skeleton)
      formLoading: state.vendorCategories.formLoading, // For form operations
      error: state.vendorCategories.error,
      pagination: state.vendorCategories.pagination,
    }),
    shallowEqual
  );
}
