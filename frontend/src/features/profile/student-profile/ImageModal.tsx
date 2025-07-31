import React, { useState } from "react";

interface ImageModalProps {
  initialData: {
    profile_pic: File | null;
  };
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
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

    
    if (formData.profile_pic) {
      data.append("profile_pic", formData.profile_pic);
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
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-900 dark:text-white"
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