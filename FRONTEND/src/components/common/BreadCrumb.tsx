import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  path: string;
};

type BreadcrumbsProps = {
  separator?: string;
  className?: string;
  routeMap?: Record<string, string>;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
};


const Breadcrumbs: React.FC<BreadcrumbsProps & { separator?: React.ReactNode }> = ({
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  className = "",
  routeMap = {},
  onItemClick,
}) => {
  // Default route mapping for common routes
  const defaultRouteMap: Record<string, string> = {
    'user-management': 'User Management',
    'employee-management': 'Employee Management',
    'role-management': 'Role Management',
    'feature-management': 'Feature Management',
    'enterprise-management': 'Enterprise Management',
    'service-category': 'Service Category',
    'venue-management': 'Venue Management',
    'vendor-management': 'Vendor Management',
    'form-builder': 'Form Builder',
    'form-list': 'Form List',
    'content-policy': 'Content Policy',
    'dashboard': 'Dashboard',
    'profile-setting': 'Profile Setting',
  };

  // Merge default map with provided routeMap (provided routeMap takes precedence)
  const combinedRouteMap = { ...defaultRouteMap, ...routeMap };
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);

  // Filter out 'edit' and IDs but keep track of them for determining edit mode
  const isEditMode = segments.includes('edit') || segments.some(seg => /^[0-9a-fA-F]{24}$/.test(seg));
  const isAddMode = segments.includes('new');
  
  const filteredSegments = segments.filter((segment) => {
    // Remove 'edit' and MongoDB ObjectIDs (24-character hex strings)
    if (segment === 'edit' || /^[0-9a-fA-F]{24}$/.test(segment)) {
      return false;
    }
    return true;
  });

  let items: BreadcrumbItem[] = filteredSegments.map((segment, index) => {
    let label = combinedRouteMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    
    // Handle add cases for last breadcrumb
    if (index === filteredSegments.length - 1 && segment === 'new') {
      const prevSegment = index > 0 ? filteredSegments[index - 1] : '';
      const moduleName = combinedRouteMap[prevSegment] || prevSegment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      label = `Add ${moduleName}`;
    }
    
    return {
      label,
      path: "/" + filteredSegments.slice(0, index + 1).join("/"),
    };
  });

  // For edit mode, add "Edit [Module Name]" as the last breadcrumb
  if (isEditMode && filteredSegments.length > 0) {
    const lastSegment = filteredSegments[filteredSegments.length - 1];
    const moduleName = combinedRouteMap[lastSegment] || lastSegment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      label: `Edit ${moduleName}`,
      path: location.pathname,
    });
  }

  const handleClick = (item: BreadcrumbItem, index: number) => {
    onItemClick ? onItemClick(item, index) : navigate(item.path);
  };

  return (
    <nav className={clsx("text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-2">
        <li>
          <Link to="/" className="text-neutral-400 hover:none font-semibold">
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path} className="flex items-center space-x-2">
              <span className="text-neutral-400 ">{separator}</span>
              {isLast ? (
                <span
                  className="font-semibold text-blue-600 cursor-pointer"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  className="text-neutral-400 cursor-pointer focus:outline-none"
                  onClick={() => handleClick(item, index)}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
