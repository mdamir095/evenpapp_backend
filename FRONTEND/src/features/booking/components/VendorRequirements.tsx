import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  Eye,
  MessageSquare,
  DollarSign,
  Clock,
  RefreshCw,
  MapPin,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import TableComponent from '../../../components/atoms/Table';
import { useToast } from '../../../components/atoms/Toast';

interface RequirementRow {
  id: string;
  requirementNumber: string;
  customerName: string;
  customerEmail: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  budget: number;
  description: string;
  status: string;
  createdAt: string;
  quotesCount: number;
  isQuoted: boolean;
}

export const VendorRequirements: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  // Mock data - replace with actual API calls
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Load requirements
  const loadRequirements = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRequirements: RequirementRow[] = [
        {
          id: '1',
          requirementNumber: 'REQ-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          eventType: 'Wedding',
          eventDate: '2024-12-15',
          location: 'Mumbai, Maharashtra',
          guestCount: 200,
          budget: 500000,
          description: 'Looking for wedding venue and catering services',
          status: 'open',
          createdAt: '2024-01-15T10:00:00Z',
          quotesCount: 3,
          isQuoted: false,
        },
        {
          id: '2',
          requirementNumber: 'REQ-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          eventType: 'Corporate Event',
          eventDate: '2024-11-20',
          location: 'Delhi, NCR',
          guestCount: 50,
          budget: 200000,
          description: 'Annual corporate meeting with lunch',
          status: 'open',
          createdAt: '2024-01-14T14:30:00Z',
          quotesCount: 1,
          isQuoted: true,
        },
      ];

      setRequirements(mockRequirements);
    } catch (error) {
      console.error('Failed to load requirements:', error);
      toast.error('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadRequirements();
  }, [currentPage, rowsPerPage, searchQuery, eventTypeFilter, dateFromFilter, dateToFilter, budgetFilter]);

  // Table columns for requirements
  const columns = [
    {
      key: 'requirementNumber',
      title: 'Requirement ID',
      sortable: true,
      render: (value: string, row: RequirementRow) => (
        <button
          onClick={() => navigate(`/vendor/requirements/${row.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      key: 'customerName',
      title: 'Customer',
      sortable: true,
      render: (value: string, row: RequirementRow) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'eventType',
      title: 'Event Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'eventDate',
      title: 'Event Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'guestCount',
      title: 'Guests',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'budget',
      title: 'Budget',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'quotesCount',
      title: 'Quotes',
      render: (value: number, row: RequirementRow) => (
        <div className="text-center">
          <div className="text-sm font-medium">{value}</div>
          {row.isQuoted && (
            <div className="text-xs text-green-600">You quoted</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => {
        const getStatusConfig = (status: string) => {
          switch (status.toLowerCase()) {
            case 'open':
              return { color: 'text-green-700 bg-green-100', text: 'Open' };
            case 'closed':
              return { color: 'text-red-700 bg-red-100', text: 'Closed' };
            case 'in_progress':
              return { color: 'text-yellow-700 bg-yellow-100', text: 'In Progress' };
            default:
              return { color: 'text-gray-700 bg-gray-100', text: status };
          }
        };

        const config = getStatusConfig(value);

        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.text}
          </span>
        );
      },
    },
  ];

  // Handle row actions for requirements
  const handleRowAction = async (action: string, row: RequirementRow) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/vendor/requirements/${row.id}`);
          break;
        case 'quote':
          navigate(`/vendor/requirements/${row.id}/quote`);
          break;
        case 'chat':
          navigate(`/vendor/chat/requirement/${row.id}`);
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setEventTypeFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setBudgetFilter('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Customer Requirements</h2>
            <Breadcrumbs />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="muted"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <Button
              variant="muted"
              size="sm"
              onClick={loadRequirements}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/vendor/bookings')}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              My Bookings
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1">
              <InputGroup
                placeholder="Search requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
                name="search"
              />
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SelectGroup
                  label="Event Type"
                  value={eventTypeFilter ? [{ label: eventTypeFilter, value: eventTypeFilter }] : []}
                  onChange={(selected) => setEventTypeFilter(selected[0]?.value || '')}
                  options={[
                    { value: '', label: 'All Event Types' },
                    { value: 'wedding', label: 'Wedding' },
                    { value: 'corporate', label: 'Corporate Event' },
                    { value: 'birthday', label: 'Birthday Party' },
                    { value: 'conference', label: 'Conference' },
                    { value: 'exhibition', label: 'Exhibition' },
                  ]}
                />
                
                <InputGroup
                  label="From Date"
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  name="dateFrom"
                />
                
                <InputGroup
                  label="To Date"
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  name="dateTo"
                />

                <SelectGroup
                  label="Budget Range"
                  value={budgetFilter ? [{ label: budgetFilter, value: budgetFilter }] : []}
                  onChange={(selected) => setBudgetFilter(selected[0]?.value || '')}
                  options={[
                    { value: '', label: 'All Budgets' },
                    { value: '0-50000', label: '₹0 - ₹50,000' },
                    { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
                    { value: '100000-500000', label: '₹1,00,000 - ₹5,00,000' },
                    { value: '500000+', label: '₹5,00,000+' },
                  ]}
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="muted"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <TableComponent
          data={requirements}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalPages: Math.ceil(requirements.length / rowsPerPage),
            totalItems: requirements.length,
            itemsPerPage: rowsPerPage,
          }}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowAction={handleRowAction}
          featureName="Vendor Requirements"
          uniqueId="vendor_requirements"
          showActions={true}
          customActions={[
            { key: 'view', label: 'View Details', icon: Eye },
            { key: 'quote', label: 'Submit Quote', icon: DollarSign },
            { key: 'chat', label: 'Chat', icon: MessageSquare },
          ]}
        />
      </div>
    </Layout>
  );
};

export default VendorRequirements;
