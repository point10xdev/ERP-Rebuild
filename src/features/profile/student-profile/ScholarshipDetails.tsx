import React from 'react';
import type { ScholarshipDetailsProps } from './types';
import conf from "../../../types/conf.json";


export const ScholarshipDetails: React.FC<ScholarshipDetailsProps> = ({ user }) => {
  const get = (val: string, obj: Record<string, string>, ci = false) => {
    if (!val) return val;
    if (ci) {
      const match = Object.keys(obj).find(
        (k) => k.toLowerCase() === val.toLowerCase()
      );
      return match ? obj[match] : val;
    }
    return obj[val] || val;
  };
  return (
    <div className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Scholarship Details</h2>
      <div className='grid grid-cols-2 gap-4'>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Basic Scholarship: {user.scholarship_basic != null
          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(user.scholarship_basic)
          : 'N/A'}
      </p>
        <p className="text-gray-500 dark:text-gray-400 mb-2">HRA Scholarship: {user.scholarship_hra}</p>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
        Admission Category:{" "}
        {get(user.admission_category, conf.admission_category)}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Research Category: {get(user.rf_category, conf.research_category)}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Type Of Work: {get(user.type_of_work, conf.type_of_work, true)}
      </p>
      </div>
    </div>
  );
}; 