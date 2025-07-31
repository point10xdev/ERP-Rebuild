import React from 'react';
import type { SupervisorDetailsProps } from './types';

export const SupervisorDetails: React.FC<SupervisorDetailsProps> = ({ user }) => {
  return (
    <div className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Supervisor Details</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2">Supervisor: {user.supervisor_name}</p>
    </div>
  );
}; 