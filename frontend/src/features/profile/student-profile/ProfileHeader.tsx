import React from "react";
import type { ProfileHeaderProps } from "./types";

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isHovering,
  onHoverChange,
  onProfilePicChange,
}) => {
  return (
    <div className="flex gap-6 items-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div
        className="relative group"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        {user.profile_pic ? (
          <img
            src={`http://localhost:8000${user.profile_pic}`}
            alt="Student"
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
            {user.name.charAt(0)}
          </div>
        )}
        <button
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 transition-opacity duration-200 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
          onClick={onProfilePicChange}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {user.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Phone: {user.phone_number}
        </p>
        <p className="text-gray-500 dark:text-gray-400">Email: {user.email}</p>
      </div>
    </div>
  );
};
