import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from "../../auth/store/authAtoms";z
import { useAuth } from "../../auth/store/customHooks";
import { ProfileHeader } from "./ProfileHeader";
import { EnrolledDetails } from "./EnrolledDetails";
import { AddressDetails } from "./AddressDetails";
import { BankDetails } from "./BankDetails";
import { ScholarshipDetails } from "./ScholarshipDetails";
import { SupervisorDetails } from "./SupervisorDetails";
import type { BankDetails as BankDetailsType } from "./types";
import { UserInfoModal } from "./UserInfoModal";
import { Pencil, User, CreditCard, Award, Users, MapPin } from "lucide-react";
import { ContactModal } from "./ContactInfoModal";
import { AddressModal } from "./AddressModal";    
import { ImageModal } from "./ImageModal";

const tabs = [
  { id: "enrolled", label: "Enrolled Details", icon: User },
  // { id: "address", label: "Address", icon: MapPin },
  { id: "bank", label: "Bank Details", icon: CreditCard },
  { id: "scholarship", label: "Scholarship", icon: Award },
  { id: "supervisor", label: "Supervisor", icon: Users },
];

const StudentProfile: React.FC = () => {
  const { user, selectedRole } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("enrolled");
  const fileInputRef = useRef<HTMLInputElement>(null);
 const [showContactModal, setShowContactModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [bankDetails, setBankDetails] = useState<BankDetailsType>({
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
  });

  const [addressDetails, setAddressDetails] = useState({
    present_address: "",
    current_address: "",
  });

  useEffect(() => {
    if (user) {
      setBankDetails({
        account_number: user.account_no || "",
        ifsc_code: user.ifsc || "",
        account_holder_name: user.name || "",
      });
      setAddressDetails({
        present_address: user.present_address || "",
        current_address: user.current_address || "",
      });
    }
  }, [user, selectedRole]);

  if (!user) return null;

  const handleUserInfoSubmit = async (data: FormData) => {
    try {
      const new_data = new FormData();
      const fields = [
        "phone_number",
        "present_address",
        "current_address",
        "account_no",
        "ifsc",
      ];

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
        `http://127.0.0.1:8000/api/users/student/${user.id}/`,
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

  const handleBankDetailsChange = (
    field: keyof BankDetailsType,
    value: string
  ) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("account_no", bankDetails.account_number);
      formData.append("ifsc", bankDetails.ifsc_code);

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/student/${user.id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bank details");
      }

      const updated = await response.json();
      setIsEditingBank(false);
    } catch (err) {
      console.error("Error updating bank details:", err);
    }
  };

  const handleAddressDetailsChange = (field: string, value: string) => {
    setAddressDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("present_address", addressDetails.present_address);
      formData.append("current_address", addressDetails.current_address);

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/student/${user.id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update address details"
        );
      }

      const updated = await response.json();
      setIsEditingAddress(false);
    } catch (err) {
      console.error("Error updating address details:", err);
    }
  };

  const handleProfilePicChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("profile_pic", file);

        const response = await fetch(
          `http://127.0.0.1:8000/api/users/student/${user.id}/`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update profile picture"
          );
        }

        const updated = await response.json();
      } catch (err) {
        console.error("Error updating profile picture:", err);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "enrolled":
        return <EnrolledDetails user={user} />;
      // case "address":
      //   return (
      //     <AddressDetails
      //       user={user}
      //       addressDetails={addressDetails}
      //       isEditing={isEditingAddress}
      //       onEdit={() => setIsEditingAddress(true)}
      //       onChange={handleAddressDetailsChange}
      //       onSubmit={handleAddressDetailsSubmit}
      //       onCancel={() => setIsEditingAddress(false)}
      //     />
      //   );
      case "bank":
        return (
          <BankDetails
            bankDetails={bankDetails}
            isEditing={isEditingBank}
            onEditToggle={() => setIsEditingBank(!isEditingBank)}
            onBankDetailsSubmit={handleBankDetailsSubmit}
            onBankDetailsChange={handleBankDetailsChange}
          />
        );
      case "scholarship":
        return <ScholarshipDetails user={user} />;
      case "supervisor":
        return <SupervisorDetails user={user} />;
      default:
        return <EnrolledDetails user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-500">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Backgrounds */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div> */}

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
      <div className="rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-in-out relative group">

        <div className="relative mb-12">
          <div className="bg-white/80 dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 transform hover:scale-[1.01] transition-all duration-500">
            <div className="relative flex">
              <button
          onClick={() => setShowContactModal(true)}
          className="absolute top-4 right-4 p-2 bg-indigo-100 text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-200"
          title="Edit Contact Info"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
          </svg>
        </button>
              <ProfileHeader
                user={user}
                isHovering={isHovering}
                onHoverChange={setIsHovering}
                onProfilePicChange={handleProfilePicChange}
              />
            </div>
          </div>
        </div>
        </div>


        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20 dark:border-gray-700/50">
            <div className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="transition-all duration-500 ease-in-out">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal */}
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative transform animate-slideInUp">
            <UserInfoModal
              initialData={{
                phone_number: user.phone_number || "",
                present_address: user.present_address || "",
                current_address: user.current_address || "",
                profile_pic: null,
                account_no: user.account_no || "",
                ifsc: user.ifsc || "",
              }}
              onClose={() => setShowModal(false)}
              onSubmit={handleUserInfoSubmit}
            />
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;
