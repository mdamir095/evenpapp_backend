import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/slices/authSlice';
import { userSlice } from '../features/user/slices/userSlice';
import { employeeSlice } from '../features/employee/slices/employeeSlice';
import { roleSlice } from '../features/role/slices/roleSlice';
import { featureSlice } from '../features/feature/slices/featureSlice';
import { enterpriseSlice } from '../features/enterprise/slices/enterpriseSlice';
import { venueCategorySlice } from '../features/venue-category/slices/venueCategorySlice';
import { VenueSlice } from '../features/venue/slices/venueSlice';
import { serviceCategorySlice } from '../features/serviceCategory/slices/ServiceCategorySlice';
import { vendorCategorySlice } from '../features/vendorCategory/slices/VendorCategorySlice';
import vendorReducer from '../features/vendorManagement/slices/VendorSlice';
import { contentPolicySlice } from '../features/content-policy/slices/contentPolicySlice';
import bookingReducer from '../features/booking/slices/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: userSlice.reducer,
    employees: employeeSlice.reducer, // ✅ Added employee slice
    roles: roleSlice.reducer,
    features: featureSlice.reducer,
    serviceCategories: serviceCategorySlice.reducer,
    vendorCategories: vendorCategorySlice.reducer,
    vendor: vendorReducer,
    enterprises: enterpriseSlice.reducer,
    venueCategory: venueCategorySlice.reducer,
    venue: VenueSlice.reducer, // Assuming venue is part of the venueCategory slice
    contentPolicy: contentPolicySlice.reducer,
    booking: bookingReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
