import React, { useState } from "react";

interface BankProps {
  initialData: {
    account_no: string,
    ifsc: string,
  };
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const BankModal: React.FC<BankProps> = ({
  initialData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profile_pic: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Only append non-null values
    if (formData.ifsc) {
      data.append("ifsc", formData.ifsc);
    }
    if (formData.account_no) {
      data.append("account_no", formData.account_no);
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Update Profile Info
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="account_no"
            placeholder="account Number"
            value={formData.account_no}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="ifsc"
            placeholder="ifsc"
            value={formData.ifsc}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
         
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};