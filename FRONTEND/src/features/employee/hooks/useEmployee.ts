import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../../../redux/store';

export function useEmployee() {
  return useSelector(
    (state: RootState) => ({
      employees: state.employees.employees,
      selectedEmployee: state.employees.selectedEmployee,
      loading: state.employees.loading,
      formLoading: state.employees.formLoading,
      error: state.employees.error,
      pagination: state.employees.pagination,
      features: state.employees.features ?? [],
    }),
    shallowEqual
  );
}
