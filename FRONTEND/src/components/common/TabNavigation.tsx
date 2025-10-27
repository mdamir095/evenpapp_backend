import React from 'react';
import { Check, User, Shield } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
}) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const isCompleted = tab.completed;
          const isClickable = !disabled && (isCompleted || tab.id === activeTab);
          
          return (
            <button
              key={tab.id}
              onClick={() => isClickable && onTabChange(tab.id)}
              disabled={!isClickable}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : isCompleted
                    ? 'border-green-500 text-green-600 hover:border-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {/* Tab Icon/Status */}
              <div className={`
                mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center
                ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'}
              `}>
                {isCompleted ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  tab.icon
                )}
              </div>

              {/* Tab Content */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tab.title}</span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Step 1
                    </span>
                  )}
                  {index === 1 && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Step 2
                    </span>
                  )}
                </div>
                <div className={`
                  text-xs mt-0.5
                  ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}
                `}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
