import React from "react";
import { NavLink } from "react-router-dom";
import type { EnrolledDetailsProps } from "./types";
import conf from "../../../types/conf.json";

export const EnrolledDetails: React.FC<EnrolledDetailsProps> = ({ user }) => {
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
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Enrolled Details: 
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Enrollment: {user.enroll}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Registration: {user.registration}
      </p> {/* FIX: Closed the previous <p> tag and added new ones for each detail */}
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Course: {user.course}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Department: {get(user.department, conf.college.departments)}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        University: {get(user.university, conf.college.university)}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Joining Date: {new Date(user.joining_date).toLocaleDateString()}
      </p>

      {/* <NavLink
        to="/dashboard/courses"
        className="inline-block mt-4 rounded-full text-indigo-800 dark:text-indigo-200 p-2 hover:shadow-md px-4 text-sm bg-indigo-100 dark:bg-indigo-900 font-bold"
      >
        View Courses
      </NavLink> */}
    </div>
  );
};