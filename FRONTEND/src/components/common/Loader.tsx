export function LoaderNoData({ size = 24, variant = 'full' }: { size?: number; variant?: 'full' | 'inline' }) {
  const containerClass = variant === 'full' ? 'flex items-center justify-center h-screen flex-col' : 'flex items-center justify-center py-8 flex-col';
  
  return (
    <div className={containerClass}>
       <svg
        className="animate-spin text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={40}
        height={40}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="mt-4 text-sm text-gray-600">Loading, please wait...</span>
    </div>
  );
}
export default LoaderNoData;