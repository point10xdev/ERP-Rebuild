import React, { useState } from "react";
// import { useAuth } from "../../auth/store/authAtoms";
import { useAuth } from "../../auth/store/customHooks";

import type { Faculty } from "../../../types/faculty";
import { ProfileHeader } from "./ProfileHeader";
import { ProfessionalDetails } from "./ProfessionalDetails";
import { PersonalDetails } from "./PersonalDetails";
import { AddressDetails } from "./AddressDetails";
import { FacultyInfoModal } from "./FacultyInfoModal";
import { ContactModal } from "./ContactInfoModal";
import { AddressModal } from "./AddressModal";    
import { ImageModal } from "./ImageModal";

const FacultyProfile: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
   const [showContactModal, setShowContactModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Type guard to check if user is a Faculty
  const isFaculty = (user: any): user is Faculty => {
    // Check for all required faculty properties
    if (!user) {
      return false;
    }
    const isFacultyType =
      user &&
      typeof user === "object" &&
      "designation" in user &&
      "department" in user &&
      "university" in user &&
      "type_of_employee" in user &&
      "nature_of_employment" in user;

    return isFacultyType;
  };

  const handleUserInfoSubmit = async (data: FormData) => {
    try {
      const new_data = new FormData();
      const fields = ["phone_number", "address"];

      fields.forEach((key) => {
        const value = data.get(key);
        if (value && typeof value === "string" && value.trim()) {
          new_data.append(key, value);
        }
      });

      const profilePic = data.get("profile_pic");
      if (profilePic instanceof File) {
        new_data.append("profile_pic", profilePic);
      }

      if (![...new_data.entries()].length) {
        setShowModal(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/faculty/${user.id}/`,
        {
          method: "PATCH",
          body: new_data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user info");
      }

      const updated = await response.json();
      setShowModal(false);
    } catch (err) {
      console.error("Error updating user info:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-900 dark:text-white">Loading profile...</p>
      </div>
    );
  }

  if (!isFaculty(user)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-900 dark:text-white">Invalid user type. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-in-out relative group">

        {/* Edit button inside profile header */}
        <button
          onClick={() => setShowContactModal(true)}
          className="absolute top-4 right-4 p-2 bg-indigo-100 text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-200"
          title="Edit Contact Info"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
          </svg>
        </button>

        <div className="flex gap-6 items-center">
          <div className="relative group">
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt="Faculty"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                {user.name?.charAt(0)}
              </div>
            )}
            {/* Edit overlay for image */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
            <p className="text-gray-500">Phone: {user.phone_number}</p>
            <p className="text-gray-500">Email: {user.email}</p>
          </div>
        </div>
      </div>
      <ProfessionalDetails user={user} />
      <PersonalDetails user={user} />
     <div className="  duration-300 relative group">
        <button
          onClick={() => setShowAddressModal(true)}
          className="absolute top-4 right-4 p-2 bg-indigo-100 text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-200"
          title="Edit Address"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
          </svg>
        </button>
        <AddressDetails user={user} />
      </div>

      {showModal && (
        <FacultyInfoModal
          initialData={{
            phone_number: user.phone_number || "",
            address: user.address || "",
            profile_pic: null,
          }}
          onClose={() => setShowModal(false)}
          onSubmit={handleUserInfoSubmit}
        />
      )}
      {showContactModal && (
        <ContactModal
        initialData={{
            phone_number: user.phone_number || "",
            email : user.email || "",
          }}
          onClose={() => setShowContactModal(false)}
          onSubmit={handleUserInfoSubmit}
        />
      )}

      {showAddressModal && (
        <AddressModal
        initialData={{
            address: user.address || ""
          }}
          onClose={() => setShowAddressModal(false)}
          onSubmit={handleUserInfoSubmit}
        />
      )}

      {showImageModal && (
        <ImageModal
        initialData={{
            profile_pic: null,
          }}
          onClose={() => setShowImageModal(false)}
          onSubmit={handleUserInfoSubmit}
        />
      )}
    </div>

    
  );
};

export default FacultyProfile;
