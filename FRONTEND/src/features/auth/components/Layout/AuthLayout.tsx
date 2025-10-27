import React from 'react';

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-no-repeat font-sans" style={{ backgroundImage: "url('/assets/images/bg.png')" }}>
      {/* Left: Form Area */}
      <div className="w-full md:w-1/2 flex flex-col justify-left px-8 sm:px-16 md:px-24 lg:px-32 bg-white mt-auto min-h-screen">
      <div className="space-x-2 mt-6 mb-10">
          <img
            src="/assets/images/logo.svg"
            alt="Logo"
            className="rounded w-30 h-30 block logoDashborad"
          />
        </div>
        {children}
      </div>

      {/* Right: Illustration */}
      <div
        className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col items-center justify-center px-12 relative bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/LoginBg-f.png')" }}
      >
        <img
          src="/assets/images/event-management1.jpg"
          alt="Dashboard"
          className="max-w-full rounded-lg shadow-xl"
        />
        <h2 className="text-xl font-bold mt-6 text-center">Easy-to-Use Dashboard for Managing Your Business.</h2>
        <p className="text-sm text-center mt-2 text-blue-100">
          Streamline your business management with our user-friendly dashboard. Simplify complex tasks,
          track key metrics, and make informed decisions effortlessly.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
