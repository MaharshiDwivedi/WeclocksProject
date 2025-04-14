import React from 'react';
import { PulseLoader } from 'react-spinners';

const Loader = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top of everything
      }}>
        <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 bg-slate-600 text-white p-4 flex flex-col">
        {/* Logo area */}
        <div className="h-12 mb-6">
          <div className="h-6 w-3/4 bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Navigation items */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="mb-4">
            <div className="h-6 w-full bg-slate-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-100">
        {/* Header */}
        <div className="bg-slate-100 p-4 border-b">
          <div className="flex justify-between">
            <div className="h-6 w-64 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-slate-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="p-4 bg-neutral-200">
          <div className="h-6 w-48 bg-slate-300 rounded animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date selector */}
          <div className="mb-6">
            <div className="h-12 w-64 bg-white rounded-md shadow animate-pulse"></div>
          </div>

          {/* Dashboard content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chart area */}
            <div className="flex-1">
              <div className="bg-white rounded-md shadow p-4 h-80">
                <div className="h-6 w-48 bg-slate-200 rounded mb-4 animate-pulse"></div>
                <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Actual Expense Card */}
              <div className="bg-white rounded-md shadow p-4 h-40">
                <div className="h-6 w-32 bg-slate-200 rounded mb-6 animate-pulse"></div>
                <div className="h-12 w-24 bg-slate-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded mx-auto animate-pulse"></div>
              </div>

              {/* Expected Expense Card */}
              <div className="bg-white rounded-md shadow p-4 h-40">
                <div className="h-6 w-36 bg-slate-200 rounded mb-6 animate-pulse"></div>
                <div className="h-12 w-24 bg-slate-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
      </div>
    );
  };
  
export default Loader;