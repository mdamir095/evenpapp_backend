import React from 'react';
import { SearchCheck } from 'lucide-react';
import { Button } from '../atoms/Button';

interface NoDataProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NoData: React.FC<NoDataProps> = ({
  message = 'No data available.',
  icon = "SearchCheck",
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px] ${className}`}>
    {/* {icon && <div className="my-4 text-4xl text-sky-800">{<SearchCheck />}</div>} */}
    <h4 className="text-lg text-blue-600 dark:text-sky-950 mb-4">{message}</h4>
    {/* <Button variant='primary'> Search Again </Button> */}
  </div>
);
