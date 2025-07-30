import React from 'react';
import type { PersonalDetailsProps } from './types';

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({ user }) => {
  const details = [
    { label: 'Date of Birth', value: new Date(user.date_of_birth).toLocaleDateString() },
    { label: 'Phone', value: user.phone_number },
    { label: 'Email', value: user.email }
  ];

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
        Personal Details
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {details.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 