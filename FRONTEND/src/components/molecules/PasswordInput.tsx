
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // ✅ Use consistent icon names
import Input from '../atoms/Input';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, className = '', size = 'md', ...inputProps }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (value: string): string => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must include a number';
    if (!/[!@#$%^&*]/.test(value)) return 'Password must include a special character (!@#$%^&*)';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError(validatePassword(value));
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={inputProps.id} className="mb-2 font-semibold text-gray-800 block">
          {label}
        </label>
      )}
        <Input
          {...inputProps}
          type="password"
          value={password}
          onChange={handleChange}
          className={`${className} pr-10`}
          size={size as 'sm' | 'md' | 'lg'}
        />
        {/* <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer p-0"
        >
          {showPassword ? (
            <Eye className="w-5 h-5 text-gray-700" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-700" />
          )}
        </button> */}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default PasswordInput;
