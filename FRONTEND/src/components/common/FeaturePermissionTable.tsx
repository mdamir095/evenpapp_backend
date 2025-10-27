import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CheckboxWithLabel } from '../molecules/CheckboxWithLabel';

type PermissionType = 'read' | 'write' | 'admin';

export type FeaturePermission = {
  featureId: string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
};

export type Feature = {
  id: string;
  name: string;
};

interface FeaturePermissionTableProps {
  features: Feature[];
  name: string; // e.g. "features"
}

export const FeaturePermissionTable: React.FC<FeaturePermissionTableProps> = ({
  features,
  name,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const current = field.value || [];

        const updatePermission = (
          featureId: string,
          permission: PermissionType,
          checked: boolean
        ) => {
          // Check if feature already exists in current array
          const existingFeatureIndex = current.findIndex((fp: FeaturePermission) => fp.featureId === featureId);
          
          let updated: FeaturePermission[];
          
          if (existingFeatureIndex !== -1) {
            // Feature exists, update it
            updated = current.map((fp: FeaturePermission) => {
              if (fp.featureId === featureId) {
                let newPermissions = { ...fp.permissions, [permission]: checked };

                // When admin is checked, automatically check read and write
                if (permission === 'admin' && checked) {
                  newPermissions.read = true;
                  newPermissions.write = true;
                }
                
                // When admin is unchecked, automatically uncheck read and write
                if (permission === 'admin' && !checked) {
                  newPermissions.read = false;
                  newPermissions.write = false;
                }

                // When read or write is checked independently, uncheck admin
                if ((permission === 'read' || permission === 'write') && checked) {
                  newPermissions.admin = false;
                }

                return { ...fp, permissions: newPermissions };
              }
              return fp;
            });
          } else {
            // Feature doesn't exist, create new entry
            const newFeaturePermission: FeaturePermission = {
              featureId: featureId,
              permissions: {
                read: false,
                write: false,
                admin: false,
                [permission]: checked
              }
            };

            // Apply the same logic for admin permissions on new entries
            if (permission === 'admin' && checked) {
              newFeaturePermission.permissions.read = true;
              newFeaturePermission.permissions.write = true;
            }

            updated = [...current, newFeaturePermission];
          }

          field.onChange(updated);
        };

        const isChecked = (featureId: string, permission: PermissionType) => {
          const found = current.find((fp: FeaturePermission) => fp.featureId === featureId);
          return found?.permissions?.[permission] ?? false;
        };

        const isDisabled = (featureId: string, permission: PermissionType) => {
          // Disable read and write checkboxes when admin is checked
          if ((permission === 'read' || permission === 'write')) {
            return isChecked(featureId, 'admin');
          }
          return false;
        };

        return (
          <div className="overflow-hidden rounded-md border border-gray-200">
             <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-md bg-white">
              <thead className="bg-gray-50 font-medium">
                <tr className="bg-neutral-100">
                  <th className="px-4 py-3 font-semibold text-sm border-b border-neutral-300 w-[30%]">
                    Feature
                  </th>
                  {['write', 'read', 'admin'].map((perm) => (
                    <th
                      key={perm}
                      className="px-4 py-3 font-semibold text-sm border-b border-neutral-300 text-center capitalize w-[15%]"
                    >
                      {perm}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm">{feature.name}</td>
                    {(['write', 'read', 'admin'] as PermissionType[]).map((perm) => (
                      <td key={perm} className="text-center px-4 py-3 text-sm">
                        <CheckboxWithLabel
                          label=""
                          name={`${feature.id}-${perm}`}
                          id={`${feature.id}-${perm}`}
                          checked={isChecked(feature.id, perm)}
                          disabled={isDisabled(feature.id, perm)}
                          onChange={(checked: boolean) => updatePermission(feature.id, perm, checked)}
                        />
                         {/* <Checkbox
                         checked={isChecked(feature.id, perm)}
                          onChange={(e) =>
                            updatePermission(feature.id, perm, e.target.checked)
                          }
                          size="lg"
                        /> */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {/* {features.length > 10 && (
              <div className="w-full mx-auto mt-2">
                <PaginationBar
                  currentPage={1}
                  totalPages={Math.ceil(features.length / 10)}
                  pageSize={100}
                  totalItems={features.length}
                  onPageChange={() => {}}
                />
              </div>
            )} */}
          </div>
        );
      }}
    />
  );
};
