import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useFeature() {
  return useSelector(
    (state: RootState) => ({
      features: state.features.features,
      selectedFeature: state.features.selectedFeature,
      loading: state.features.loading, // For list fetching (skeleton)
      formLoading: state.features.formLoading, // For form operations
      error: state.features.error,
      pagination: state.features.pagination,
    }),
    shallowEqual
  );
}
