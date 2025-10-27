import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '../../../types/Employee';

interface Feature {
  id: string;
  name: string;
}

interface EmployeeState {
  employees: Employee[];
  features: Feature[];
  selectedEmployee: Employee | null;
  loading: boolean;
  formLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: EmployeeState = {
  employees: [],
  features: [],
  selectedEmployee: null,
  loading: false,
  formLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    fetchEmployeesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess(
      state,
      action: PayloadAction<{
        employees: Employee[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>
    ) {
      state.loading = false;
      state.employees = action.payload.employees;
      state.pagination = action.payload.pagination;
      state.error = null;
    },    
    fetchEmployeesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addEmployeeStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addEmployeeSuccess(state, action: PayloadAction<Employee>) {
      state.formLoading = false;
      state.employees.push(action.payload);
    },
    addEmployeeFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeEmployeeStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeEmployeeSuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.employees = state.employees.filter((employee: Employee) => employee.id !== action.payload);
    },
    removeEmployeeFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateEmployeeStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateEmployeeSuccess(state, action: PayloadAction<Employee>) {
      state.formLoading = false;
      state.employees = state.employees.map((employee: Employee) =>
        employee.id === action.payload.id ? action.payload : employee
      );
    },
    updateEmployeeFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchEmployeeByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeeByIdSuccess(state, action: PayloadAction<Employee>) {
      state.loading = false;
      state.selectedEmployee = action.payload;
    },
    fetchEmployeeByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Features actions
    fetchFeaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchFeaturesSuccess(state, action: PayloadAction<Feature[]>) {
      state.loading = false;
      state.features = action.payload;
    },
    fetchFeaturesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchEmployeesStart, 
  fetchEmployeesSuccess, 
  fetchEmployeesFailure, 
  addEmployeeStart, 
  addEmployeeSuccess, 
  addEmployeeFailure, 
  removeEmployeeStart, 
  removeEmployeeSuccess, 
  removeEmployeeFailure, 
  updateEmployeeStart, 
  updateEmployeeSuccess, 
  updateEmployeeFailure,
  fetchEmployeeByIdStart, 
  fetchEmployeeByIdSuccess, 
  fetchEmployeeByIdFailure, 
  fetchFeaturesStart,
  fetchFeaturesSuccess,
  fetchFeaturesFailure
} = employeeSlice.actions;
