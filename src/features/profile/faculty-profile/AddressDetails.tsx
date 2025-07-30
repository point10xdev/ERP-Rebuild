import React from 'react';
import type { AddressDetailsProps } from './types';

export const AddressDetails: React.FC<AddressDetailsProps> = ({ user }) => {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
        Address
      </h2>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Address</span>
        <p className="text-gray-900 dark:text-white whitespace-pre-line">{user.address}</p>
      </div>
    </div>
  );
}; 