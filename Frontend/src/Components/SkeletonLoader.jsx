import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 animate-pulse">
      <div className="bg-white shadow-lg rounded-[14px] overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-gray-200 p-3 md:p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
            <div className="h-6 w-48 bg-gray-300 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-300 rounded-md"></div>
        </div>

        {/* Search and Filter Section Skeleton */}
        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-grow max-w-full sm:max-w-[300px]">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-gray-300 rounded-full"></div>
            <div className="w-full h-10 pl-10 bg-gray-200 rounded-md"></div>
          </div>
          <div className="relative w-full sm:w-[150px] h-10 bg-gray-200 rounded-md"></div>
        </div>

        {/* Table Skeleton */}
        <div className="p-3 md:p-4">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-5 gap-4 mb-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded hidden md:block"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>

          {/* Table Rows */}
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="grid grid-cols-5 gap-4">
                <div className="h-12 bg-gray-100 rounded flex items-center justify-center">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-100 rounded flex items-center justify-center">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-100 rounded flex items-center justify-center">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-100 rounded hidden md:flex items-center justify-center">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-100 rounded flex items-center justify-center gap-2">
                  <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center border-t pt-4">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2 sm:mb-0"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;