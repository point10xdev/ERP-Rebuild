import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/store/customHooks";
import { getScholarships, postScholarship } from "../../../services/index";
import { showSuccess, showError, showInfo } from "../../../utils/toast";
import conf from "../../../types/conf.json";
import type { Scholarship } from "../../../types/scholarship";
import type { Role } from "../../../types/roles";
  const allowedRoles = ["FAC", "HOD", "AD", "DEAN"] as const;
  type AllowedRole = typeof allowedRoles[number];

interface ExtendedScholarship extends Scholarship {
  role: string; // Role under which this scholarship is listed (derived from API response keys)
  selected: boolean; // Local UI state for bulk selection
  days: number; // Local UI state for deducted days, initialized to 0 if not from API
}

export const ApproveScholarship = () => {
  const { user, selectedRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingScholarships, setPendingScholarships] = useState<Record<string, ExtendedScholarship[]>>({});
  const [selectedScholarship, setSelectedScholarship] = useState<ExtendedScholarship | null>(null);
  const [baseScholarship, setBaseScholarship] = useState<ExtendedScholarship | null>(null);

  const [comment, setComment] = useState("");
  const [selectAll, setSelectAll] = useState<Record<string, boolean>>({});
  const [editingDays, setEditingDays] = useState(false);
  const [editedDays, setEditedDays] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check if user has FAC role
  const isDEAN = ["AD", "DEAN"];
  const isFAC = selectedRole === "FAC";
  const isHOD = selectedRole === "HOD";

  const getMonthName = (monthNumber: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1] || "";
  };
  const fetchPendingScholarships = async () => {
  if (!user || !selectedRole) {
    console.log("No user or role found");
    return;
  }

  try {
    setLoading(true);

    const response = await getScholarships({
      faculty: user.id,
      role: selectedRole,
      type: "role_pending",
    });

    if (!response || Object.keys(response).length === 0) {
      console.log("No scholarships received from API");
      setPendingScholarships({});
      return;
    }

    const transformedData = Object.entries(response).reduce(
      (acc, [role, scholarships]) => {
        const typedScholarships = scholarships as Scholarship[];
        acc[role] = typedScholarships.map((scholarship: Scholarship) => ({
          ...scholarship,
          role,
          selected: false,
          days: 0,
        }));
        return acc;
      },
      {} as Record<string, ExtendedScholarship[]>
    );

    setPendingScholarships(transformedData);

    const initialSelectAll = Object.keys(transformedData).reduce(
      (acc, role) => {
        acc[role] = false;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setSelectAll(initialSelectAll);
  } catch (error) {
    console.error("Failed to fetch pending scholarships:", error);
    setPendingScholarships({});
    setError("Failed to fetch scholarships. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPendingScholarships();
    setSelectedScholarship(null); // Reset selected scholarship on re-fetch
  }, [user, selectedRole]);

  const handleSelectAll = (role: string) => {
    setPendingScholarships((prev) => {
      const newSelectedState = !selectAll[role]; // Toggle based on current first item's selected state
      return {
        ...prev,
        [role]: prev[role].map((sch) => ({
          ...sch,
          selected: newSelectedState,
        })),
      };
    });

    setSelectAll((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const handleSelectScholarship = (role: string, scholarshipId: number) => {
    setPendingScholarships((prev) => ({
      ...prev,
      [role]: prev[role].map((sch) =>
        sch.id === scholarshipId ? { ...sch, selected: !sch.selected } : sch
      ),
    }));
  };

  const handleScholarshipClick = (scholarship: ExtendedScholarship) => {
    setSelectedScholarship(scholarship);
    setBaseScholarship(scholarship); // Store the original for potential reset
    setEditedDays(scholarship.days || 0);
    setEditingDays(false);
  };

  // Helper function to handle common post-action logic
  const handlePostActionSuccess = (
    role: string,
    scholarshipIds: number[],
    message: string,
    resetComment = true
  ) => {
    fetchPendingScholarships();
    setSelectedScholarship(null);
    setBaseScholarship(null);
    if (resetComment) setComment("");
    setSelectAll((prev) => ({ ...prev, [role]: false })); // Deselect all for that role
    showSuccess(message);
  };

  const handleBulkApprove = async (role: string) => {
    if (!allowedRoles.includes(selectedRole as AllowedRole)) {
      showError("You are not authorized to approve scholarships for this role.");
      return;
    }
    const selected = pendingScholarships[role].filter((sch) => sch.selected);
    if (selected.length === 0) {
      window.alert("Please select at least one scholarship.");
      return;
    }

    try {
      const responses = await Promise.all(
        selected.map((scholarship) =>
          postScholarship({
            id: String(scholarship.id),
            faculty: String(user?.id),
            role: selectedRole as AllowedRole,
            status: "accept",
            comment: comment || "",
            deducted_days: scholarship.days || 0,
          })
        )
      );

      const allSuccessful = responses.every((res) => res?.success);
      const approvedIds = selected.filter((_, index) => responses[index]?.success).map(s => s.id);

      if (allSuccessful) {
        handlePostActionSuccess(
          role,
          approvedIds,
          "All selected scholarships approved."
        );
      } else {
        // Handle partial success: remove only successfully approved ones
        handlePostActionSuccess(
          role,
          approvedIds,
          "Some selected scholarships approved, others failed."
        );
        throw new Error("Some approvals failed."); // Log actual error
      }
    } catch (error) {
      console.error("Bulk approval failed:", error);
      showError("Bulk approval failed. Please try again.");
    }
  };

  const handleApprove = async (role: string, scholarshipId: number) => {
    if (!user) return;
    if (!allowedRoles.includes(selectedRole as AllowedRole)) {
      showError("You are not authorized to approve scholarships for this role.");
      return;
    }
    try {
      const response = await postScholarship({
        id: String(scholarshipId),
        faculty: String(user.id),
        role: selectedRole as AllowedRole,
        status: "accept",
        comment: comment || undefined,
        deducted_days: selectedScholarship?.days || undefined,
      });

      if (response && response.success) {
        setPendingScholarships((prev) => ({
          ...prev,
          [role]: prev[role].filter((sch) => sch.id !== scholarshipId),
        }));
        setSelectedScholarship(null);
        setBaseScholarship(null);
        setComment("");
        showSuccess(
          `Scholarship Successfully Accepted by ${
            selectedRole ? conf.college.roles[selectedRole] : "User"
          }`
        );
      } else {
        throw new Error("Approval failed");
      }
    } catch (error) {
      console.error("Approval error:", error);
      showError("Approval failed. Try again.");
    }
  };

  const handleReject = async (role: string, scholarshipId: number) => {
    if (!user) return;
    if (!allowedRoles.includes(selectedRole as AllowedRole)) {
      showError("You are not authorized to reject scholarships for this role.");
      return;
    }

    try {
      const response = await postScholarship({
        id: String(scholarshipId),
        faculty: String(user.id),
        role: selectedRole as AllowedRole,
        status: "reject",
        comment: comment || undefined,
        deducted_days: selectedScholarship?.days || undefined,
      });

      if (response && response.success) {
        setPendingScholarships((prev) => ({
          ...prev,
          [role]: prev[role].filter((sch) => sch.id !== scholarshipId),
        }));
        setSelectedScholarship(null);
        setBaseScholarship(null);
        setComment("");
        showInfo(
          `Scholarship Rejected by ${
            selectedRole ? conf.college.roles[selectedRole] : "User"
          }`
        );
      } else {
        throw new Error("Rejection failed");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      showError("Rejection failed. Try again.");
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDays = parseInt(value, 10);

    if (value === "") {
      setEditedDays(NaN);
    } else if (!isNaN(newDays) && newDays >= 0) {
      setEditedDays(newDays);
    }
  };

  const handleDaysSave = async () => {
    if (!selectedScholarship || isNaN(editedDays)) {
      showError("Please enter a valid number of days.");
      return;
    }

    if (editedDays < 0) {
        showError("Days cannot be negative.");
        return;
    }

    const updatedScholarship = { ...selectedScholarship, days: editedDays };

    setPendingScholarships((prev) => ({
      ...prev,
      [selectedScholarship.role]: prev[selectedScholarship.role].map((sch) =>
        sch.id === selectedScholarship.id ? updatedScholarship : sch
      ),
    }));

    setSelectedScholarship(updatedScholarship);
    setEditingDays(false);

    const deduction = Number(updatedScholarship.total_pay_per_day) * editedDays;
    const newAmount = Number(updatedScholarship.total_pay) - deduction;

    window.alert(
      `Days updated to ${editedDays}. Amount after deduction: ₹${newAmount.toFixed(
        2
      )}`
    );
  };

  const handleDaysCancel = () => {
    setEditingDays(false);
    setEditedDays(selectedScholarship?.days || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="p-6 dark:bg-gray-900">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        Approve Scholarships
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {Object.entries(pendingScholarships).map(([role, scholarships]) => (
            <div key={role} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium dark:text-white">
                  Pending Approvals
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectAll[role] || false}
                    onChange={() => handleSelectAll(role)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Select All
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {scholarships.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending scholarships to approve.
                  </p>
                ) : (
                  scholarships.map((scholarship) => (
                    <div
                      key={scholarship.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedScholarship?.id === scholarship.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleScholarshipClick(scholarship)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={scholarship.selected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectScholarship(role, scholarship.id);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                          <div>
                            <h4 className="font-medium dark:text-white">
                              {scholarship.student_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {getMonthName(scholarship.month)}{" "}
                              {scholarship.year}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {/* Category: {scholarship.category} */}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {scholarships.some((sch) => sch.selected) && (
                <div className="mt-4">
                  <button
                    onClick={() => handleBulkApprove(role)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    Approve Selected (
                    {scholarships.filter((sch) => sch.selected).length})
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedScholarship ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">
                Scholarship Details
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Student
                  </h4>
                  <p className="font-medium dark:text-white">
                    {selectedScholarship.student_name}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Amount
                  </h4>
                  <p className="text-xl font-medium dark:text-white">
                    ₹{selectedScholarship.total_pay}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-gray-500 dark:text-gray-400">
                      Days to be deducted
                    </h4>
                    {isFAC && !editingDays && (
                      <button
                        onClick={() => {
                          console.log("Edit days clicked, isFAC:", isFAC);
                          setEditingDays(true);
                          setEditedDays(selectedScholarship.days);
                        }}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition-all duration-200"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingDays ? (
                    <div className="mt-2 flex items-center space-x-3">
                      <input
                        type="number"
                        value={isNaN(editedDays) ? "" : editedDays}
                        onChange={handleDaysChange}
                        className="w-24 px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        days in {getMonthName(selectedScholarship.month)},{" "}
                        {selectedScholarship.year}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDaysSave}
                          className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow transition-all duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleDaysCancel}
                          className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="dark:text-white mt-1">
                      {selectedScholarship.days} days in{" "}
                      {getMonthName(selectedScholarship.month)},{" "}
                      {selectedScholarship.year}
                    </p>
                  )}

                  {selectedScholarship.days > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Original Amount:
                        </span>
                        <span className="font-medium dark:text-white">
                          ₹{Number(selectedScholarship.total_pay).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Deduction Amount:
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -₹
                          {(
                            Number(selectedScholarship.total_pay_per_day) *
                            selectedScholarship.days
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Final Amount:
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ₹
                          {(
                            Number(selectedScholarship.total_pay) -
                            Number(selectedScholarship.total_pay_per_day) *
                              selectedScholarship.days
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    Breakdown
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Per Day: ₹
                    {Number(selectedScholarship.total_pay_per_day).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Comments
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder="Add any comments about the approval..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() =>
                      handleReject(
                        selectedScholarship.role,
                        selectedScholarship.id
                      )
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      handleApprove(
                        selectedScholarship.role,
                        selectedScholarship.id
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a scholarship to approve or reject
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
