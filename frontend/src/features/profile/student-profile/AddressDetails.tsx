import React from 'react';
import type { AddressDetailsProps } from './types';

export const AddressDetails: React.FC<AddressDetailsProps> = ({ user }) => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Present Address</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">{user.present_address}</p>
      </div>

      <div className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Current Address</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">{user.current_address}</p>
      </div>
    </div>
  );
}; 