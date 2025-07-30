import React from "react";
import type { BankDetailsProps } from "./types";

export const BankDetails: React.FC<BankDetailsProps> = ({
  bankDetails,
  isEditing,
  onEditToggle,
  onBankDetailsSubmit,
  onBankDetailsChange,
}) => {
  return (
    <div className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Bank Account Details
        </h2>
        <button
          onClick={onEditToggle}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {isEditing ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          )}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={onBankDetailsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="account_holder_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Account Holder's Name
              </label>
              <input
                type="text"
                id="account_holder_name"
                value={bankDetails.account_holder_name}
                onChange={(e) =>
                  onBankDetailsChange("account_holder_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter account holder's name"
              />
            </div>
            <div>
              <label
                htmlFor="account_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Account Number
              </label>
              <input
                type="text"
                id="account_number"
                value={bankDetails.account_number}
                onChange={(e) =>
                  onBankDetailsChange("account_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label
                htmlFor="ifsc_code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                IFSC Code
              </label>
              <input
                type="text"
                id="ifsc_code"
                value={bankDetails.ifsc_code}
                onChange={(e) =>
                  onBankDetailsChange("ifsc_code", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter IFSC code"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onEditToggle}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Account Holder's Name
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              {bankDetails.account_holder_name || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Account Number
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              {bankDetails.account_number || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              IFSC Code
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              {bankDetails.ifsc_code || "Not provided"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
