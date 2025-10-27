import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/atoms/Button';

/**
 * Unauthorized Access Page
 * 
 * Displayed when user tries to access a route/module they don't have permission for.
 * Provides clear messaging and navigation options.
 */

interface LocationState {
  error?: string;
  from?: Location;
}

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const errorMessage = state?.error || "You don't have permission to access this page";
  const fromPath = state?.from?.pathname || '/unknown';

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleContactAdmin = () => {
    // You can implement contact admin functionality here
    // For now, just show an alert
    alert('Please contact your system administrator to request access to this module.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>

        {/* Attempted Path Info */}
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Attempted to access:</p>
          <p className="text-sm font-mono text-gray-700">{fromPath}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            onClick={handleGoHome}
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>

          <Button
            onClick={handleContactAdmin}
            variant="secondary"
            className="w-full"
          >
            Request Access
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
