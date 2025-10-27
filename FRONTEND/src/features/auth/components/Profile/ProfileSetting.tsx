import { useState } from 'react';
import UpdateProfile from './UpdateProfile';
import ChangePassword from '../Password/ChangePassword';
import Layout from '../../../../layouts/Layout';
import { Button } from '../../../../components/atoms/Button';
import Breadcrumbs from '../../../../components/common/BreadCrumb';

const tabs = [
  { label: 'Personal Info', value: 'personal' },
  { label: 'Change Password', value: 'account' },
  // { label: 'Upload Image', value: 'security' },
];

export default function ProfileSetting() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <Layout>
      <div className="text-gray-800 ">
        <div className="grid grid-cols-1 gap-4 mb-6">
         
          <div className="grid grid-cols-1 gap-4 mb-6">
             <h2 className="text-xl font-semibold mb-0">User Management</h2>
             <Breadcrumbs/>
          </div>
          <div className="w-full mx-auto  space-y-6">
            {/* Tab Headers */}
            <div className="flex gap-6 border justify-left border-gray-300 bg-white rounded-lg w-1/2  py-2 px-3" >
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? 'secondary' : 'default'}
                  onClick={() => setActiveTab(tab.value)}
                  className={`pb-2 text-sm font-bold  w-[50%]  relative ${
                    activeTab === tab.value
                      ? 'bg-blue-100 text-blue-600 border-0 hover:bg-blue-200 hover:text-bg-blue-100 '
                      : 'text-gray-400 hover:text-bg-blue-100 hover:bg-blue-50'
                  }`}
                >
                  {tab.label}
                  <span className="text-blue-600 slide"></span>
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'personal' && <UpdateProfile />}
              {activeTab === 'account' && <ChangePassword />}
              {/* {activeTab === 'security' && <ChangePassword />} */}
            </div>
          </div>
          </div>
      </div>
      </Layout>
  );
}



