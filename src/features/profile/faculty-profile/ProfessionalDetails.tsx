import React from "react";
import type { ProfessionalDetailsProps } from "./types";
import conf from "../../../types/conf.json";

export const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({
  user,
}) => {
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
  // get(user.admission_category, conf.admission_category)
  const details = [
    { label: "Designation", value: get(user.designation, conf.designation) },
    {
      label: "Department",
      value: get(user.department, conf.college.departments),
    },
    {
      label: "University",
      value: get(user.university, conf.college.university),
    },
    {
      label: "Type of Employee",
      value: get(user.type_of_employee, conf.type_of_employee),
    },
    {
      label: "Nature of Employment",
      value: get(user.nature_of_employment, conf.nature_of_employment),
    },
  ];

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
        Professional Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <span className="text-gray-900 dark:text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
