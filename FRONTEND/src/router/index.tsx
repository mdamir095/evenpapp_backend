import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth
import LoginForm from '../features/auth/components/Login/LoginForm';
import RegisterForm from '../features/auth/components/Login/RegisterForm';
import ForgotPassword from '../features/auth/components/Password/ForgotPassword';
import ResetPassword from '../features/auth/components/Password/ResetPassword';
import LogoutButton from '../features/auth/components/Auth/LogoutButton';
import ProfileSetting from '../features/auth/components/Profile/ProfileSetting';

// Dashboard
import Dashboard from '../features/dashboard/components/Dashboard';

// Users
import UserList from '../features/user/components/UserList';
import UserForm from '../features/user/components/UserForm';

// Employees
import EmployeeList from '../features/employee/components/EmployeeList';
import EmployeeForm from '../features/employee/components/EmployeeForm';

// Roles
import RoleList from '../features/role/components/RoleList';
import RoleForm from '../features/role/components/RoleForm';

// Features
import FeatureList from '../features/feature/components/FeatureList';
import FeatureForm from '../features/feature/components/FeatureForm';


// Auth Guards
import RequireAuth from './RequireAuth';
import ProtectedRoute from './ProtectedRoute';
import Forms from '../features/forms';
import EnterpriseList from '../features/enterprise/components/EnterpriseList';
import EnterpriseForm from '../features/enterprise/components/EnterpriseForm';
import EnterpriseEmailVerify from '../features/enterprise/components/ResetPassword';

import AddVenueForm from '../features/venue/components/AddVenueForm';
import { ROUTING } from '../constants/routes';
import DynamicFormList from '../features/forms/components/FormList';
import ServiceCategoryList from '../features/serviceCategory/components/ServiceCategoryList';
import ServiceCategoryForm from '../features/serviceCategory/components/ServiceCategoryForm';
import VenueList from '../features/venue/components/VenueList';
import VendorList from '../features/vendorManagement/components/VendorList';
import VendorForm from '../features/vendorManagement/components/VendorForm';
import ContentPolicyList from '../features/content-policy/components/ContentPolicyList';
import ContentPolicyForm from '../features/content-policy/components/ContentPolicyForm';

// Booking Management
import BookingIndex from '../features/booking/components/BookingIndex';
import BookingList from '../features/booking/components/BookingList';
import BookingForm from '../features/booking/components/BookingForm';
import BookingDashboard from '../features/booking/components/BookingMangement';

import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* -------------------- Public Routes -------------------- */}
        <Route path="/" element={<LoginForm />} />
        <Route path={ROUTING.LOGIN} element={<LoginForm />} />
        <Route path={ROUTING.REGISTER} element={<RegisterForm />} />
        <Route path={ROUTING.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTING.RESET_PASSWORD} element={<ResetPassword />} />

        {/* ------------------ Protected Routes ------------------- */}
        <Route path={ROUTING.DASHBOARD} element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* User Management - Protected by User Management feature permission */}
        <Route path={ROUTING.GET_ALL_USERS} element={<ProtectedRoute requiredFeature="user_management" requiredPermission="read"><UserList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_USER} element={<ProtectedRoute requiredFeature="user_management" requiredPermission="write"><UserForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_USER} element={<ProtectedRoute requiredFeature="user_management" requiredPermission="write"><UserForm /></ProtectedRoute>} />

        {/* Employee Management - Protected by Employee Management feature permission */}
        <Route path={ROUTING.GET_ALL_EMPLOYEES} element={<ProtectedRoute requiredFeature="employee_management" requiredPermission="read"><EmployeeList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_EMPLOYEE} element={<ProtectedRoute requiredFeature="employee_management" requiredPermission="write"><EmployeeForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_EMPLOYEE} element={<ProtectedRoute requiredFeature="employee_management" requiredPermission="write"><EmployeeForm /></ProtectedRoute>} />

        {/* Role Management - Protected by Role Management feature permission */}
        <Route path={ROUTING.GET_ALL_ROLES} element={<ProtectedRoute requiredFeature="role_management" requiredPermission="read"><RoleList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_ROLE} element={<ProtectedRoute requiredFeature="role_management" requiredPermission="write"><RoleForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_ROLE} element={<ProtectedRoute requiredFeature="role_management" requiredPermission="write"><RoleForm /></ProtectedRoute>} />

        {/* Feature Management - Protected by Feature Management feature permission */}
        <Route path={ROUTING.GET_ALL_FEATURES} element={<ProtectedRoute requiredFeature="feature_management" requiredPermission="read"><FeatureList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_FEATURE} element={<ProtectedRoute requiredFeature="feature_management" requiredPermission="write"><FeatureForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_FEATURE} element={<ProtectedRoute requiredFeature="feature_management" requiredPermission="write"><FeatureForm /></ProtectedRoute>} />

        {/* Enterprise Management - Protected by Enterprise Management feature permission */}
        <Route path={ROUTING.GET_ALL_ENTERPRISES} element={<ProtectedRoute requiredFeature="enterprise_management" requiredPermission="read"><EnterpriseList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_ENTERPRISE} element={<ProtectedRoute requiredFeature="enterprise_management" requiredPermission="write"><EnterpriseForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_ENTERPRISE} element={<ProtectedRoute requiredFeature="enterprise_management" requiredPermission="write"><EnterpriseForm /></ProtectedRoute>} />
        <Route path={ROUTING.GET_ALL_ENTERPRISES + "/reset-password"} element={<EnterpriseEmailVerify />} />

        {/* Category Management - Protected by Category Management feature permission */}
        <Route path={ROUTING.GET_ALL_CATEGORIES} element={<ProtectedRoute requiredFeature="service_category" requiredPermission="read"><ServiceCategoryList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_CATEGORY} element={<ProtectedRoute requiredFeature="service_category" requiredPermission="write"><ServiceCategoryForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_CATEGORY} element={<ProtectedRoute requiredFeature="service_category" requiredPermission="write"><ServiceCategoryForm /></ProtectedRoute>} />

        {/* Vendor Management - Protected by Vendor Management feature permission */}
        <Route path={ROUTING.VENDOR_MANAGEMENT} element={<ProtectedRoute requiredFeature="vendor_management" requiredPermission="read"><VendorList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_VENDORS} element={<ProtectedRoute requiredFeature="vendor_management" requiredPermission="write"><VendorForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_VENDORS} element={<ProtectedRoute requiredFeature="vendor_management" requiredPermission="write"><VendorForm /></ProtectedRoute>} />
         
        {/* Form Builder - Protected by Form Builder feature permission */}
        <Route path={ROUTING.FORM_LIST} element={<ProtectedRoute requiredFeature="form_builder" requiredPermission="read"><DynamicFormList /></ProtectedRoute>} />
        <Route path={ROUTING.FORM_BUILDER} element={<ProtectedRoute requiredFeature="form_builder" requiredPermission="write"><Forms /></ProtectedRoute>} />

        {/* Profile / Account */}
        <Route path={ROUTING.PROFILE_SETTING} element={<RequireAuth><ProfileSetting /></RequireAuth>} />
        <Route path={ROUTING.LOGOUT} element={<RequireAuth><LogoutButton /></RequireAuth>} />

        {/* -------------------- Venue Management - Protected by Venue Management feature permission -------------------- */}  
        <Route path={ROUTING.VENUE_MANAGEMENT} element={<ProtectedRoute requiredFeature="venue_management" requiredPermission="read"><VenueList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_VENUE} element={<ProtectedRoute requiredFeature="venue_management" requiredPermission="write"><AddVenueForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_VENUE} element={<ProtectedRoute requiredFeature="venue_management" requiredPermission="write"><AddVenueForm /></ProtectedRoute>} />



        {/* Content Policy Management - Protected by Content Policy Management feature permission */}
        <Route path={ROUTING.CONTENT_POLICY} element={<ProtectedRoute requiredFeature="content_policy" requiredPermission="read"><ContentPolicyList /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_CONTENT_POLICY} element={<ProtectedRoute requiredFeature="content_policy" requiredPermission="write"><ContentPolicyForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_CONTENT_POLICY} element={<ProtectedRoute requiredFeature="content_policy" requiredPermission="write"><ContentPolicyForm /></ProtectedRoute>} />

        {/* Booking Management - Protected by Booking Management feature permission */}
        <Route path={ROUTING.BOOKING_MANAGEMENT} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="read"><BookingIndex /></ProtectedRoute>} />
        <Route path={ROUTING.BOOKING_LIST} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="read"><BookingList /></ProtectedRoute>} />
        <Route path={ROUTING.BOOKING_DASHBOARD} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="read"><BookingDashboard /></ProtectedRoute>} />
        <Route path={ROUTING.ADD_BOOKING} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="write"><BookingForm /></ProtectedRoute>} />
        <Route path={ROUTING.UPDATE_BOOKING} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="write"><BookingForm /></ProtectedRoute>} />
        <Route path={ROUTING.VIEW_BOOKING} element={<ProtectedRoute requiredFeature="booking_management" requiredPermission="read"><BookingForm /></ProtectedRoute>} />

        {/* -------------------- Error Pages -------------------- */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
