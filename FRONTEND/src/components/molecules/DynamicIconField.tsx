import React from 'react';
import { FiImage, FiUser, FiMail, FiLock } from 'react-icons/fi';

const iconMap = {
  image: FiImage,
  user: FiUser,
  email: FiMail,
  password: FiLock,
};

const DynamicIconField = ({ type = 'user', label = 'Field Label' }) => {
  const Icon = iconMap[type] || FiUser;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Icon className="text-blue-500 w-6 h-6" />
      </div>
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
  );
};

export default DynamicIconField;
