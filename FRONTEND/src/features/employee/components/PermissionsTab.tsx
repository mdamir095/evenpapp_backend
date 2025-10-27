import React from 'react';
import { FeaturePermissionTable } from '../../../components/common/FeaturePermissionTable';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { Shield, Building2, Settings, Users, AlertCircle } from 'lucide-react';

interface PermissionsTabProps {
  isUserSuperAdmin: boolean;
  enterprises: any[];
  selectedEnterpriseName: string;
  setSelectedEnterpriseName: (name: string) => void;
  setEnterpriseFeatures: (features: any[]) => void;
  features: any[];
  enterpriseFeatures: any[];
  featuresLoaded: boolean;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  isUserSuperAdmin,
  enterprises,
  selectedEnterpriseName,
  setSelectedEnterpriseName,
  setEnterpriseFeatures,
  features,
  enterpriseFeatures,
  featuresLoaded,
}) => {
  // Create value for SelectGroup with proper format
  const selectValue = React.useMemo(() => {
    if (!selectedEnterpriseName) return [];
    
    const foundOption = enterprises.find(e => e.enterpriseName === selectedEnterpriseName);
    if (foundOption) {
      return [{ label: foundOption.enterpriseName, value: foundOption.enterpriseName }];
    }
    return [];
  }, [selectedEnterpriseName, enterprises]);

  // Determine which features to show
  const displayFeatures = isUserSuperAdmin ? enterpriseFeatures : features;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">
              Permissions & Enterprise Settings
            </h3>
            <p className="text-sm text-purple-700">
              Configure feature permissions and enterprise access
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Selection Section - For Super Admin Only */}
      {isUserSuperAdmin && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h4 className="text-md font-semibold text-gray-800">Enterprise Selection</h4>
          </div>
          
          <div className="space-y-4">
            <div className="w-1/2">
                             <SelectGroup
                 key={`enterprise-select-${enterprises.length}-${selectedEnterpriseName}`}
                 label="Select Enterprise *"
                 value={selectValue}
                 onChange={(selected) => {
                   const value = Array.isArray(selected) ? selected[0]?.value || '' : '';
                   setSelectedEnterpriseName(value);
                   setEnterpriseFeatures([]);
                 }}
                 options={[
                   { value: '', label: 'Choose an enterprise...' },
                   ...enterprises.map((enterprise) => ({
                     value: enterprise.enterpriseName,
                     label: enterprise.enterpriseName,
                   })),
                 ]}
                 isMulti={false}
                 error={isUserSuperAdmin && !selectedEnterpriseName ? 'Enterprise selection is required' : undefined}
               />
            </div>
            
                         {selectedEnterpriseName ? (
               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                 <div className="flex items-center gap-2">
                   <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                     <Users className="w-3 h-3 text-white" />
                   </div>
                   <div>
                     <h5 className="text-sm font-semibold text-green-800">
                       Enterprise Selected: {selectedEnterpriseName}
                     </h5>
                     <p className="text-sm text-green-700">
                       Features and permissions are now configured for this enterprise.
                     </p>
                   </div>
                 </div>

               </div>
             ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h5 className="text-sm font-semibold text-yellow-800">
                      Enterprise Selection Required
                    </h5>
                    <p className="text-sm text-yellow-700">
                      Please select an enterprise to access and configure feature permissions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Permissions Section */}
      {(!isUserSuperAdmin || (isUserSuperAdmin && selectedEnterpriseName)) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="text-md font-semibold text-gray-800">
              Feature Permissions
              {isUserSuperAdmin && selectedEnterpriseName && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  for {selectedEnterpriseName}
                </span>
              )}
            </h4>
          </div>

          {/* Loading State */}
          {!featuresLoaded && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading feature permissions...</p>
              </div>
            </div>
          )}

          {/* No Features Available */}
          {featuresLoaded && (!displayFeatures || displayFeatures.length === 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h5 className="text-lg font-semibold text-gray-700 mb-2">
                No Features Available
              </h5>
              <p className="text-gray-600">
                {isUserSuperAdmin 
                  ? 'No features are available for the selected enterprise.' 
                  : 'No features are currently available for permission configuration.'
                }
              </p>
            </div>
          )}

          {/* Feature Permission Table */}
          {featuresLoaded && displayFeatures && displayFeatures.length > 0 && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-blue-500 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 mb-1">
                      Permission Guidelines
                    </h5>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Read:</strong> View data and reports</p>
                      <p><strong>Write:</strong> Create and edit content</p>
                      <p><strong>Admin:</strong> Full control including user management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permission Table */}
              <div className="border border-gray-200 rounded-lg">
                <FeaturePermissionTable 
                  features={displayFeatures} 
                  name="features" 
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Total Features: 
                    </span>
                    <span className="ml-1 text-gray-600">
                      {displayFeatures.length}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Configure permissions carefully based on employee role
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Super Admin - No Enterprise Selected State */}
      {isUserSuperAdmin && !selectedEnterpriseName && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Enterprise Selection Required
            </h4>
            <p className="text-gray-600 mb-4">
              Please select an enterprise above to configure feature permissions for this employee.
            </p>
            <div className="text-sm text-gray-500">
              Feature permissions are enterprise-specific and cannot be configured without selecting one.
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PermissionsTab;
