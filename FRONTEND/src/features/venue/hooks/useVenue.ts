import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useVenue() {
  return useSelector(
    (state: RootState) => ({
      venues: state.venue.venues,
      selectedVenue: state.venue.selectedVenue,
      loading: state.venue.loading,
      error: state.venue.error,
      pagination: state.venue.pagination,
    }),
    shallowEqual
  );
}