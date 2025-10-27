import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { TabNavigation } from '../../../components/common/TabNavigation';
import { FormError } from '../../../components/atoms/FormError';
import { Button } from '../../../components/atoms/Button';

import { Calendar, User, CreditCard, CheckCircle } from 'lucide-react';

// Import schemas and types
import { 
  type BookingType
} from '../schemas/booking.schema';

// Step components will be defined inline for now

// Import hooks
import { useBookingActions } from '../hooks/useBookingActions';
import { useBooking } from '../hooks/useBooking';

interface BookingFormProps {
  initialData?: Partial<BookingType>;
  mode?: 'create' | 'edit';
  onSuccess?: (booking: BookingType) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialData,
  mode = 'create',
  onSuccess,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState<'service' | 'customer' | 'payment' | 'confirmation'>('service');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Partial<BookingType>>(initialData || {});

  // Redux state and actions
  const bookingState = useBooking();
  const { formLoading } = bookingState || {};
  const { addBooking, updateBooking, fetchBookingById } = useBookingActions();

  // Form setup - using partial validation for step-by-step form
  const methods = useForm<BookingType>({
    mode: 'onChange',
    defaultValues: {
      type: 'service',
      source: 'web',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      duration: 60,
      customer: {
        name: '',
        email: '',
        phoneNumber: '',
        countryCode: '+91',
      },
      services: [],
      payment: {
        method: 'credit_card',
        amount: 0,
        currency: 'INR',
        finalAmount: 0,
        status: 'pending',
      },
      notifications: {
        email: true,
        sms: false,
        whatsapp: false,
      },
      ...initialData,
    },
  });

  // Load existing booking data in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadBookingData = async () => {
        try {
          const booking = await fetchBookingById(id);
          setBookingData(booking);
          methods.reset(booking);
          
          // Mark completed steps based on existing data
          const completed = new Set<string>();
          if (booking.services?.length > 0) completed.add('service');
          if (booking.customer?.name) completed.add('customer');
          if (booking.payment?.method) completed.add('payment');
          setCompletedSteps(completed);
          
        } catch (error) {
          setError('Failed to load booking data');
        }
      };
      loadBookingData();
    }
  }, [id, mode, fetchBookingById, methods]);

  // Define tabs
  const tabs = [
    {
      id: 'service',
      title: 'Services',
      description: 'Select services and date/time',
      icon: <Calendar className="w-5 h-5" />,
      completed: completedSteps.has('service'),
    },
    {
      id: 'customer',
      title: 'Customer Details',
      description: 'Enter customer information',
      icon: <User className="w-5 h-5" />,
      completed: completedSteps.has('customer'),
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Payment details and confirmation',
      icon: <CreditCard className="w-5 h-5" />,
      completed: completedSteps.has('payment'),
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and confirm booking',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: completedSteps.has('confirmation'),
    },
  ];

  // Validation functions for each step
  const validateServiceStep = async (): Promise<boolean> => {
    const formData = methods.getValues();
    
    // Check required fields that are actually present in the form
    const requiredFields = {
      type: formData.type,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    // Validate required fields
    const missingFields = [];
    if (!requiredFields.type) missingFields.push('Booking Type');
    if (!requiredFields.date) missingFields.push('Date');
    if (!requiredFields.startTime) missingFields.push('Start Time');
    if (!requiredFields.endTime) missingFields.push('End Time');

    if (missingFields.length > 0) {
      setError(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate time logic
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return false;
    }

    setCompletedSteps(prev => new Set([...prev, 'service']));
    return true;
  };

  const validateCustomerStep = async (): Promise<boolean> => {
    const formData = methods.getValues();
    const customerData = formData.customer;
    
    // Check required fields that are actually present in the form
    const missingFields = [];
    if (!customerData?.name?.trim()) missingFields.push('Customer Name');
    if (!customerData?.email?.trim()) missingFields.push('Email Address');
    if (!customerData?.phoneNumber?.trim()) missingFields.push('Phone Number');

    if (missingFields.length > 0) {
      setError(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone number (basic check)
    if (customerData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }

    setCompletedSteps(prev => new Set([...prev, 'customer']));
    return true;
  };

  const validatePaymentStep = async (skipValidation = false): Promise<boolean> => {
    if (skipValidation) {
      // Skip validation and set default payment values
      const defaultPayment = {
        method: 'cash' as const,
        amount: 0,
        currency: 'INR',
        totalDiscount: 0,
        totalTax: 0,
        finalAmount: 0,
        status: 'pending' as const,
      };
      
      methods.setValue('payment', defaultPayment);
      setCompletedSteps(prev => new Set([...prev, 'payment']));
      return true;
    }

    const formData = methods.getValues();
    const paymentData = formData.payment;
    
    // Check required fields
    const missingFields = [];
    if (!paymentData?.method) missingFields.push('Payment Method');
    if (!paymentData?.amount || paymentData.amount <= 0) missingFields.push('Amount');

    if (missingFields.length > 0) {
      setError(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Set finalAmount if not set
    if (!paymentData.finalAmount) {
      methods.setValue('payment.finalAmount', paymentData.amount);
    }

    setCompletedSteps(prev => new Set([...prev, 'payment']));
    return true;
  };

  // Tab change handler
  const handleTabChange = async (tabId: string) => {
    setError(null);
    
    // Validate current step before moving to next
    if (activeTab === 'service' && tabId !== 'service') {
      if (!(await validateServiceStep())) return;
    }
    
    if (activeTab === 'customer' && tabId !== 'service' && tabId !== 'customer') {
      if (!(await validateCustomerStep())) return;
    }
    
    if (activeTab === 'payment' && tabId === 'confirmation') {
      if (!(await validatePaymentStep())) return;
    }

    setActiveTab(tabId as typeof activeTab);
  };

  // Skip payment step handler
  const handleSkipPayment = async () => {
    setError(null);
    if (await validatePaymentStep(true)) {
      setActiveTab('confirmation');
    }
  };

  // Form submission
  const onSubmit = async (data: BookingType) => {
    try {
      setError(null);

      // Final validation
      if (!(await validateServiceStep()) || 
          !(await validateCustomerStep()) || 
          !(await validatePaymentStep())) {
        return;
      }

      // Create a service entry based on form data if services array is empty
      let submissionData = { ...data };
      if (!submissionData.services || submissionData.services.length === 0) {
        submissionData.services = [{
          resourceId: `booking-${Date.now()}`, // Generate temporary ID
          name: `${submissionData.type} booking`,
          startDateTime: `${submissionData.date}T${submissionData.startTime}`,
          endDateTime: `${submissionData.date}T${submissionData.endTime}`,
          quantity: 1,
          pricePerUnit: submissionData.payment?.amount || 0,
          totalPrice: submissionData.payment?.finalAmount || 0,
        }];
      }

      let result;
      if (mode === 'edit' && id) {
        result = await updateBooking(id, submissionData);
      } else {
        result = await addBooking(submissionData);
      }

      setCompletedSteps(prev => new Set([...prev, 'confirmation']));
      setActiveTab('confirmation');
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/booking-management');
      }

    } catch (error: any) {
      setError(error?.message || 'Failed to save booking');
    }
  };

  // Handle back to list
  const handleCancel = () => {
    navigate('/booking-management');
  };

  // Handle step data updates
  const handleStepDataUpdate = (stepData: Partial<BookingType>) => {
    setBookingData(prev => ({ ...prev, ...stepData }));
    methods.setValue('services', stepData.services || []);
    methods.setValue('customer', stepData.customer || methods.getValues('customer'));
    methods.setValue('payment', stepData.payment || methods.getValues('payment'));
  };

  if (formLoading && mode === 'edit') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {mode === 'edit' ? 'Edit Booking' : 'Create New Booking'}
        </h2>
        <Breadcrumbs />
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
            {/* Tab Navigation */}
            <div className="px-6 pt-6">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                disabled={formLoading}
              />
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-6">
              {activeTab === 'service' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Service Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type
                      </label>
                      <select
                        {...methods.register('type')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="service">Service</option>
                        <option value="venue">Venue</option>
                        <option value="event">Event</option>
                        <option value="hotel">Hotel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        {...methods.register('location')}
                        placeholder="Enter location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        {...methods.register('date')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        {...methods.register('startTime')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'customer' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...methods.register('customer.name')}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        {...methods.register('customer.email')}
                        placeholder="Enter email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...methods.register('customer.phoneNumber')}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'payment' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        {...methods.register('payment.method')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        {...methods.register('payment.amount', { valueAsNumber: true })}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'confirmation' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Booking Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Service Details</h4>
                        <p className="text-sm text-gray-600">Type: {methods.getValues('type')}</p>
                        <p className="text-sm text-gray-600">Location: {methods.getValues('location')}</p>
                        <p className="text-sm text-gray-600">Date: {methods.getValues('date')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Details</h4>
                        <p className="text-sm text-gray-600">Name: {methods.getValues('customer.name')}</p>
                        <p className="text-sm text-gray-600">Email: {methods.getValues('customer.email')}</p>
                        <p className="text-sm text-gray-600">Phone: {methods.getValues('customer.phoneNumber')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {activeTab !== 'service' && (
                    <Button
                      type="button"
                      variant="muted"
                      size="sm"
                      onClick={() => {
                        const steps = ['service', 'customer', 'payment', 'confirmation'];
                        const currentIndex = steps.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(steps[currentIndex - 1] as typeof activeTab);
                        }
                      }}
                      disabled={formLoading}
                    >
                      ← Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="muted"
                    size="sm"
                    onClick={handleCancel}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>

                  {/* Show Skip button only for payment step */}
                  {activeTab === 'payment' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSkipPayment}
                      disabled={formLoading}
                    >
                      Skip Payment →
                    </Button>
                  )}

                  {activeTab === 'confirmation' ? (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={formLoading}
                    >
                                                  {formLoading 
                              ? 'Saving...' 
                              : mode === 'edit' 
                                ? 'Update Booking' 
                                : 'Create Booking'
                            }
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const steps = ['service', 'customer', 'payment', 'confirmation'];
                        const currentIndex = steps.indexOf(activeTab);
                        if (currentIndex < steps.length - 1) {
                          handleTabChange(steps[currentIndex + 1]);
                        }
                      }}
                      disabled={formLoading}
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4">
                  <FormError message={error} />
                </div>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </Layout>
  );
};

export default BookingForm;
