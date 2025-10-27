import { z } from 'zod';

// Enums for better type safety
export const BookingStatus = z.enum([
  'pending',
  'confirmed', 
  'cancelled',
  'completed',
  'rejected',
  'refunded'
]);

export const BookingTypeEnum = z.enum([
  'hotel',
  'event',
  'appointment',
  'service',
  'venue',
  'meeting_room'
]);

export const BookingSource = z.enum([
  'web',
  'mobile',
  'admin',
  'phone',
  'walk_in'
]);

export const PaymentMethod = z.enum([
  'credit_card',
  'debit_card',
  'paypal',
  'stripe',
  'razorpay',
  'cash',
  'bank_transfer',
  'wallet'
]);

export const PaymentStatus = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partial_refund'
]);

// Customer Details Schema
export const customerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  countryCode: z.string().default('+91'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
});

// Vendor Details Schema
export const vendorSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Valid vendor email is required'),
  phoneNumber: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  commission: z.number().min(0).max(100).optional(), // Commission percentage
});

// Service/Resource Details Schema
export const serviceResourceSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  name: z.string().min(1, 'Resource name is required'),
  category: z.string().optional(),
  vendorId: z.string().optional(), // Link to vendor
  startDateTime: z.string().min(1, 'Start date and time is required'),
  endDateTime: z.string().min(1, 'End date and time is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  pricePerUnit: z.number().min(0, 'Price cannot be negative').default(0),
  totalPrice: z.number().min(0, 'Total price cannot be negative').default(0),
  extras: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
  })).optional(),
});

// Payment Details Schema
export const paymentSchema = z.object({
  transactionId: z.string().optional(),
  method: PaymentMethod,
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.string().default('INR'),
  discounts: z.array(z.object({
    code: z.string(),
    name: z.string(),
    amount: z.number(),
    type: z.enum(['percentage', 'fixed']),
  })).optional(),
  taxes: z.array(z.object({
    name: z.string(),
    percentage: z.number(),
    amount: z.number(),
  })).optional(),
  totalDiscount: z.number().default(0),
  totalTax: z.number().default(0),
  finalAmount: z.number().min(0, 'Final amount cannot be negative'),
  status: PaymentStatus.default('pending'),
  paidAt: z.string().optional(),
  refundAmount: z.number().optional(),
  refundedAt: z.string().optional(),
});

// Main Booking Schema
export const bookingSchema = z.object({
  // Booking Details
  bookingId: z.string().optional(), // Generated on backend
  bookingNumber: z.string().optional(), // User-friendly booking number
  status: BookingStatus.default('pending'),
  type: BookingTypeEnum,
  source: BookingSource.default('web'),
  
  // Date and Time (top-level for form convenience)
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().optional(),
  
  // Customer Details
  customer: customerSchema,
  
  // Service/Resource Details
  services: z.array(serviceResourceSchema).min(1, 'At least one service is required'),
  
  // Vendor Details (for vendor-managed bookings)
  vendor: vendorSchema.optional(),
  
  // Payment Details
  payment: paymentSchema,
  
  // Additional Information
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  couponCode: z.string().optional(),
  assignedStaff: z.string().optional(),
  
  // Policies
  cancellationPolicy: z.string().optional(),
  refundPolicy: z.string().optional(),
  
  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  confirmedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  
  // Notification preferences
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  }).optional(),
});

// Search/Filter Schema
export const bookingSearchSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: BookingStatus.optional(),
  type: BookingTypeEnum.optional(),
  customerId: z.string().optional(),
  resourceId: z.string().optional(),
  assignedStaff: z.string().optional(),
  search: z.string().optional(), // General search term
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'startDateTime', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Availability Search Schema
export const availabilitySearchSchema = z.object({
  resourceType: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  quantity: z.number().min(1).default(1),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

// Reschedule Schema
export const rescheduleSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  newStartDateTime: z.string().min(1, 'New start date and time is required'),
  newEndDateTime: z.string().min(1, 'New end date and time is required'),
  reason: z.string().optional(),
});

// Cancel Schema
export const cancelSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(1, 'Cancellation reason is required'),
  refundAmount: z.number().optional(),
  notifyCustomer: z.boolean().default(true),
});

// Update Booking Schema (Admin)
export const updateBookingSchema = z.object({
  status: BookingStatus.optional(),
  assignedStaff: z.string().optional(),
  notes: z.string().optional(),
  payment: paymentSchema.partial().optional(),
  services: z.array(serviceResourceSchema).optional(),
});

// Export types
export type BookingType = z.infer<typeof bookingSchema>;
export type CustomerType = z.infer<typeof customerSchema>;
export type VendorType = z.infer<typeof vendorSchema>;
export type ServiceResourceType = z.infer<typeof serviceResourceSchema>;
export type PaymentType = z.infer<typeof paymentSchema>;
export type BookingSearchType = z.infer<typeof bookingSearchSchema>;
export type AvailabilitySearchType = z.infer<typeof availabilitySearchSchema>;
export type RescheduleType = z.infer<typeof rescheduleSchema>;
export type CancelType = z.infer<typeof cancelSchema>;
export type UpdateBookingType = z.infer<typeof updateBookingSchema>;

// Form-specific schemas for step-by-step booking
export const bookingStep1Schema = z.object({
  type: z.string(),
  services: z.array(z.object({
    resourceId: z.string().min(1, 'Please select a resource'),
    name: z.string(),
    startDateTime: z.string().min(1, 'Start date and time is required'),
    endDateTime: z.string().min(1, 'End date and time is required'),
    quantity: z.number().min(1).default(1),
  })).min(1, 'At least one service is required'),
});

export const bookingStep2Schema = customerSchema;

export const bookingStep3Schema = z.object({
  payment: paymentSchema.omit({ 
    transactionId: true, 
    status: true, 
    paidAt: true,
    refundAmount: true,
    refundedAt: true 
  }),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  }).optional(),
});

export type BookingStep1Type = z.infer<typeof bookingStep1Schema>;
export type BookingStep2Type = z.infer<typeof bookingStep2Schema>;
export type BookingStep3Type = z.infer<typeof bookingStep3Schema>;
