import React from 'react';
import { NoData } from '../components/common/NoData';
import { SearchCheck } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <>
    <NoData message="No events found." icon={<SearchCheck />} />
    {/* <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div> */}
  </>
);

export default NotFoundPage;