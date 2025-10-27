import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { IMAGE_BASE_URL } from '../config/api';

  const Header = () => {
  const user = useUser();
  const getFileName = (path: string | null | undefined) => {
    if (!path || typeof path !== 'string') return '';
    return path.split(/[/\\]/).pop() || '';
  };
  const imagePath = user?.profileImage ? getFileName(user.profileImage) : '';
  return (
    
    <header className="w-full bg-white px-6 py-4 flex items-center justify-end header-shadow z-1 fixed left-0">
      
      {/* Right - Icons & Avatar */}
      <div className="flex items-center gap-6 ">
        <button className="relative text-gray-600 hover:text-blue-600 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-2">
          {imagePath ? (
            <img
              src={`${IMAGE_BASE_URL}/${imagePath.replace(/\\/g, '/')}`}
              alt="User Avatar"
              className="h-9 w-9 rounded-full border border-gray-300"
              onError={(e) => {
                // Hide image if loading fails and show avatar instead
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-9 w-9 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
          
          <span className="hidden md:block text-gray-700 font-medium">{user?.firstName} {user?.lastName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
