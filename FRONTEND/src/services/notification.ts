// Notification service (stub)
// Replace with your preferred notification/toast library
export const notify = (message: string, type: 'success' | 'error' = 'success') => {
  alert(`[${type.toUpperCase()}] ${message}`);
};
