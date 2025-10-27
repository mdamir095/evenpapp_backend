import React from 'react';
import AppRoutes from './router';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { PermissionProvider, type Role } from './context/PermissionContext';
import { useUser } from './hooks/useUser';

function App() {
  const user = useUser();

  // Type-cast user.roles as Role[] and filter valid ones
  const validRoles: Role[] = Array.isArray(user?.roles)
    ? (user.roles as Role[]).filter(
        (r) => typeof r.id === 'string' && Array.isArray(r.features)
      )
    : [];

  return (
    <PermissionProvider roles={validRoles}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AppRoutes />
    </PermissionProvider>
  );
}

export default App;
