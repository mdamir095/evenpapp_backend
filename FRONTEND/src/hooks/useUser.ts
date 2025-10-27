import { useState, useEffect } from 'react';

export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImage?: string;
  countryCode?: string;
  phoneNumber?: string;
  organizationName?: string;
  features?: { name: string }[];
  roles?: { name: string }[]; 
};

export function useUser(): UserType | null {
  const [user, setUser] = useState<UserType | null>(null);

  const getUserFromStorage = () => {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      // Failed to parse user from localStorage
      return null;
    }
  };

  useEffect(() => {
    // Initial load
    setUser(getUserFromStorage());

    // Listen for storage changes (when localStorage is updated)
    const handleStorageChange = () => {
      const updatedUser = getUserFromStorage();
      // User update detected
      setUser(updatedUser);
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (when localStorage changes in same tab)
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  return user;
}
