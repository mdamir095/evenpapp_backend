import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useServiceCategory() {
  return useSelector(
    (state: RootState) => ({
      categories: state.serviceCategories.categories,
      selectedCategory: state.serviceCategories.selectedCategory,
      loading: state.serviceCategories.loading, // For list fetching (skeleton)
      formLoading: state.serviceCategories.formLoading, // For form operations
      error: state.serviceCategories.error,
      pagination: state.serviceCategories.pagination,
    }),
    shallowEqual
  );
}
