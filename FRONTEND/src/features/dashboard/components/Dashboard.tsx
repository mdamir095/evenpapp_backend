import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { Button } from '../../../components/atoms/Button';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { AlertCircle, X } from 'lucide-react';
import { useUserActions } from '../../user/hooks/useUserActions';
import { useUser } from '../../user/hooks/useUser';
import { useEmployeeActions } from '../../employee/hooks/useEmployeeActions';
import { useEmployee } from '../../employee/hooks/useEmployee';

// Mock data for demonstration
const mockStats = {
  totalVenues: 156,
  totalBookings: 1247,
  totalRevenue: 45678,
  activeUsers: 89,
  monthlyGrowth: 12.5,
  weeklyGrowth: 8.3
};

const mockChartData = {
  bookings: [
    { month: 'Jan', bookings: 120, revenue: 15000 },
    { month: 'Feb', bookings: 140, revenue: 17500 },
    { month: 'Mar', bookings: 160, revenue: 20000 },
    { month: 'Apr', bookings: 180, revenue: 22500 },
    { month: 'May', bookings: 200, revenue: 25000 },
    { month: 'Jun', bookings: 220, revenue: 27500 },
  ],
  topVenues: [
    { name: 'Grand Plaza Hotel', bookings: 45, revenue: 12500 },
    { name: 'City Convention Center', bookings: 38, revenue: 9800 },
    { name: 'Riverside Gardens', bookings: 32, revenue: 8200 },
    { name: 'Skyline Tower', bookings: 28, revenue: 7200 },
    { name: 'Ocean View Resort', bookings: 25, revenue: 6800 },
  ]
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <span className="text-white text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const SimpleBarChart: React.FC<{ data: any[]; height?: number }> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.bookings));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-16 text-sm text-gray-600">{item.month}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(item.bookings / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-gray-900">{item.bookings}</div>
        </div>
      ))}
    </div>
  );
};

const TopVenuesList: React.FC<{ venues: any[] }> = ({ venues }) => (
  <div className="space-y-4">
    {venues.map((venue, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{venue.name}</p>
            <p className="text-sm text-gray-500">{venue.bookings} bookings</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">${venue.revenue.toLocaleString()}</p>
          <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20) + 5}%</p>
        </div>
      </div>
    ))}
  </div>
);

const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, type: 'booking', message: 'New booking for Grand Plaza Hotel', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'venue', message: 'Ocean View Resort added new venue', time: '15 minutes ago', status: 'info' },
    { id: 3, type: 'payment', message: 'Payment received for City Convention Center', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'booking', message: 'Booking cancelled for Riverside Gardens', time: '2 hours ago', status: 'warning' },
    { id: 5, type: 'venue', message: 'Skyline Tower updated venue details', time: '3 hours ago', status: 'info' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'venue': return '🏢';
      case 'payment': return '💰';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(activity.status)}`}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{activity.message}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);
  const { pagination: userPagination } = useUser();
  const { pagination: employeePagination } = useEmployee();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const { getUserList } = useUserActions();
  const { getEmployeeList } = useEmployeeActions();

  const location = useLocation();
  const state = location.state as { error?: string; from?: Location } | null;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getUserList(currentPage, rowsPerPage, searchQuery, selectedRole);
      getEmployeeList(currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms
    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, selectedRole, rowsPerPage]);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [selectedPeriod]);

  // Handle unauthorized access message
  useEffect(() => {
    if (state?.error) {
      setShowUnauthorizedMessage(true);
      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowUnauthorizedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Unauthorized Access Message */}
        {showUnauthorizedMessage && state?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                <p className="text-sm text-red-700 mt-1">{state.error}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUnauthorizedMessage(false)}
              className="text-red-400 hover:text-red-600 ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your venues.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <SelectGroup
              label=""
              options={[
                { label: 'This Month', value: 'month' },
                { label: 'This Week', value: 'week' },
                { label: 'This Year', value: 'year' },
              ]}
              value={[{ label: 'This Month', value: selectedPeriod }]}
              onChange={(selected) => {
                const value = Array.isArray(selected) ? selected[0]?.value : selectedPeriod;
                setSelectedPeriod(value);
              }}
              isMulti={false}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total user"
            value={userPagination?.total ?? 0}
            change={mockStats.monthlyGrowth}
            icon="🏢"
            color="bg-blue-500"
          />
          <StatCard
            title="Total employee"
            value={employeePagination?.total ?? 0}
            change={mockStats.weeklyGrowth}
            icon="👥"
            color="bg-green-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${mockStats.totalRevenue.toLocaleString()}`}
            change={15.2}
            icon="💰"
            color="bg-purple-500"
          />
          <StatCard
            title="Active Users"
            value={mockStats.activeUsers}
            change={-2.1}
            icon="👥"
            color="bg-orange-500"
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Trends Chart */}
          <div className="lg:col-span-2">
            <ChartCard title="Booking Trends">
              <SimpleBarChart data={mockChartData.bookings} />
            </ChartCard>
          </div>

          {/* Top Venues */}
          <div>
            <ChartCard title="Top Performing Venues">
              <TopVenuesList venues={mockChartData.topVenues} />
            </ChartCard>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ChartCard title="Recent Activity">
              <RecentActivity />
            </ChartCard>
          </div>

          {/* Quick Actions */}
          <div>
            <ChartCard title="Quick Actions">
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Add New Venue
                </Button>
                <Button variant="muted" className="w-full">
                  View All Bookings
                </Button>
                <Button variant="muted" className="w-full">
                  Generate Report
                </Button>
                <Button variant="muted" className="w-full">
                  Manage Categories
                </Button>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
