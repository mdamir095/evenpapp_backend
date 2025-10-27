import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Filter, 
  Search, 
  Plus, 
  Download, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Button } from '../../../components/atoms/Button';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import TableComponent from '../../../components/atoms/Table';
import { useBookingActions } from '../hooks/useBookingActions';
import { useBooking } from '../hooks/useBooking';
import { useToast } from '../../../components/atoms/Toast';


interface BookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  amount: number;
  createdAt: string;
  assignedStaff?: string;
}

export const BookingList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // State (bookings and loading now come from Redux)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const bookingState = useBooking();
  const { bookings = [], pagination, loading } = bookingState || {};
  
  const { 
    getBookingList, 
    removeBooking, 
    updateBookingStatus 
  } = useBookingActions();

  // Load bookings
  const loadBookings = async () => {
    const filters = {
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
    };

    await getBookingList(currentPage, rowsPerPage, searchQuery, filters);
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadBookings();
  }, [currentPage, rowsPerPage, searchQuery, statusFilter, typeFilter, dateFromFilter, dateToFilter]);

  // Initialize filters from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    if (status) setStatusFilter(status);
    if (type) setTypeFilter(type);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Table columns
  const columns = [
    {
      key: 'bookingNumber',
      title: 'Booking ID',
      sortable: true,
      render: (value: string, row: BookingRow) => (
        <button
          onClick={() => navigate(`/booking-management/${row.id}`)}
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
      render: (value: string, row: BookingRow) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'serviceName',
      title: 'Service',
      sortable: true,
    },
    {
      key: 'startDateTime',
      title: 'Date & Time',
      sortable: true,
      render: (value: string, row: BookingRow) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {new Date(row.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
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
            case 'confirmed':
              return { color: 'text-green-700 bg-green-100', icon: CheckCircle };
            case 'pending':
              return { color: 'text-yellow-700 bg-yellow-100', icon: Clock };
            case 'cancelled':
              return { color: 'text-red-700 bg-red-100', icon: XCircle };
            case 'completed':
              return { color: 'text-blue-700 bg-blue-100', icon: CheckCircle };
            default:
              return { color: 'text-gray-700 bg-gray-100', icon: Clock };
          }
        };

        const config = getStatusConfig(value);
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            <Icon className="w-3 h-3" />
            {value}
          </span>
        );
      },
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-gray-900">₹{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'assignedStaff',
      title: 'Staff',
      render: (value: string) => value || '-',
    },
  ];

  // Handle row actions
  const handleRowAction = async (action: string, row: BookingRow) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/booking-management/${row.id}`);
          break;
        case 'edit':
          navigate(`/booking-management/${row.id}/edit`);
          break;
        case 'quotation':
          navigate(`/booking-management/${row.id}/quotation`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this booking?')) {
            await removeBooking(row.id);
            toast.success('Booking deleted successfully!');
          }
          break;
        case 'confirm':
          await updateBookingStatus(row.id, 'confirmed');
          toast.success('Booking confirmed successfully!');
          break;
        case 'reject':
          const reason = window.prompt('Please provide a reason for rejection:');
          if (reason) {
            await updateBookingStatus(row.id, 'rejected');
            toast.success('Booking rejected successfully!');
          }
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedBookings.length === 0) {
      toast.error('Please select bookings first');
      return;
    }

    try {
      // Implement bulk actions here
      // Bulk action implementation
      setSelectedBookings([]);
      loadBookings();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // Export current filtered bookings
      // Export functionality
      // TODO: Implement export functionality with current bookings
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
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
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/booking-management/create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1">
              <InputGroup
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
                name="search"
              />
            </div>
            
            <Button
              variant="muted"
              size="sm"
              onClick={loadBookings}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SelectGroup
                  label="Status"
                  value={statusFilter ? [{ label: statusFilter, value: statusFilter }] : []}
                  onChange={(selected) => setStatusFilter(selected[0]?.value || '')}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
                
                <SelectGroup
                  label="Type"
                  value={typeFilter ? [{ label: typeFilter, value: typeFilter }] : []}
                  onChange={(selected) => setTypeFilter(selected[0]?.value || '')}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'hotel', label: 'Hotel' },
                    { value: 'event', label: 'Event' },
                    { value: 'appointment', label: 'Appointment' },
                    { value: 'service', label: 'Service' },
                    { value: 'venue', label: 'Venue' },
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

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedBookings.length} booking(s) selected
              </span>
              
              <div className="flex gap-2">
                <Button
                  variant="muted"
                  size="sm"
                  onClick={() => handleBulkAction('confirm')}
                >
                  Bulk Confirm
                </Button>
                
                <Button
                  variant="muted"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                >
                  Bulk Reject
                </Button>
                
                <Button
                  variant="muted"
                  size="sm"
                  onClick={() => setSelectedBookings([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <TableComponent
          data={bookings}
          columns={columns}
          loading={loading}
          pagination={pagination}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowAction={handleRowAction}
          featureName="Booking Management"
          uniqueId="booking_management"
          showActions={true}
          showQuotationOption={true}
        />
      </div>
    </Layout>
  );
};

export default BookingList;
