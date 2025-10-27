import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useCategory() {
  return useSelector(
    (state: RootState) => ({
      categories: state.venueCategory.categories,
      selectedCategory: state.venueCategory.selectedCategory,
      loading: state.venueCategory.loading,
      error: state.venueCategory.error,
      pagination: state.venueCategory.pagination,
    }),
    shallowEqual
  );
}
