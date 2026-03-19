import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
