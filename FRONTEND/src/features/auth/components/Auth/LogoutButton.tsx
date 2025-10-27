import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthActions } from '../../hooks/useAuthActions';
import { LogOut } from 'lucide-react';

const LogoutButton: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthActions();
  if (!isAuthenticated) return null;
  
  return (
    <div className="relative group">
      <button onClick={signOut} className='px-0 hover:text-blue-600 transition-colors cursor-pointer'>
        <LogOut size={20} />
      </button>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        Logout
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default LogoutButton;
