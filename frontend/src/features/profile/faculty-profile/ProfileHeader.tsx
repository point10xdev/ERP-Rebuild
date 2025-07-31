import React from "react";
import type { ProfileHeaderProps } from "./types";

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="flex gap-8 items-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative group">
        {user.profile_pic ? (
          <img
            src={`http://localhost:8000${user.profile_pic}`}
            alt="Faculty"
            className="w-36 h-36 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors duration-200"
          />
        ) : (
          <div className="w-36 h-36 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border-4 border-purple-100 dark:border-purple-900 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors duration-200">
            <span className="text-4xl font-semibold">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {user.name}
        </h2>
        <div className="space-y-1">
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="font-medium">Phone:</span> {user.phone_number}
          </p>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};
