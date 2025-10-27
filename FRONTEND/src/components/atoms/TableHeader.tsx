import { Filter, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import React from 'react';
import { SelectGroup } from '../molecules/SelectGroup';
import SearchBox from './SearchBox';

interface TableHeaderProps {
  addButtonRoute?: string;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  showAddButton?: boolean;
  searchQuery?: string;
  roleSelect?: React.ReactNode;
  onSearchChange?: (q: string) => void;
}

export default function TableHeader({
  searchQuery = "",
  onSearchChange,
  addButtonRoute = '/user-management/new',
  addButtonText = 'Add User',
  addButtonIcon = <Plus className="size-4" />,
  showAddButton = true,
  roleSelect,
}: TableHeaderProps) {
  const navigate = useNavigate(); 

  return (
    <div className="flex grid-cols-(--my-grid-cols) flex-col md:flex-row gap-4 items-center mt-2 ">
      
      {/* 🔍 Search Bar */}
      <SearchBox
        value={searchQuery}
        onChange={(value) => onSearchChange?.(value)}
        placeholder="Search for id, name, product"
        className="role-feature-table min-h-[26px]"
      />

      {/* 🛠️ Action Buttons */}
      <div className="flex items-center gap-2  ml-auto">
        <Button className="flex items-center gap-1 "
        variant="muted">
          <Filter className="size-4" />
          Filter
        </Button>
        <Button className="flex items-center gap-1 "  variant="muted">
          <Download className="size-4" />
          Export
        </Button>
        {roleSelect && (
            <SelectGroup
              options={[
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Editor", value: "editor" },
              ]}
              value={[]}
              heightClass="min-h-[43px]"
              onChange={(selected) => {/* Selection handled */}}
              label=""
            />
          )}
        {showAddButton && (
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => navigate(addButtonRoute)}
          >
            {addButtonIcon}
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
