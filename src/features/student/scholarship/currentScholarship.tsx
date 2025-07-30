import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/store/customHooks";
import type { Scholarship, Stage } from "../../../types/scholarship";
import { getScholarships, postScholarship } from "../../../services/index";
import type { ScholarPost } from "../../../types/apiType";
import { showSuccess, showError } from "../../../utils/toast";
export const CurrentScholarship = () => {
  const { user, selectedRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  // const [approvalStages, setApprovalStages] = useState<Partial<Stage>[]>([
  //   { role: "FAC", status: "2", active: false },
  //   { role: "HOD", status: "2", active: false },
  //   { role: "AD", status: "2", active: false },
  //   { role: "DEAN", status: "2", active: false },
  // ]);

  const fetchScholarships = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await getScholarships({
        scholar: user.id,
        type: "current",
      });
      setScholarships(response.scholarships || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch scholarships:", error);
    }
  };

  const handleReleaseScholarship = async (scholarshipId: number) => {
    if (!user?.id) {
      window.alert("User not found. Please log in again.");
      return;
    }

    setReleasing(true);
    try {
      const payload: ScholarPost = {
        id: scholarshipId,
        scholar: String(user.id), // Convert number to string
      };

      const response = await postScholarship(payload);
      showSuccess("Scholarship released successfully");

      await fetchScholarships(); // Refresh scholarships after posting
    } catch (error) {
      console.error("Failed to post scholarship:", error);
      showError(
        error instanceof Error
          ? error.message
          : `Error While Releasing the Scholarship contact Administor Scholarship id ${scholarshipId}`
      );
    } finally {
      setReleasing(false);
    }
  };
  useEffect(() => {
    fetchScholarships();
  }, [user?.id, selectedRole]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentScholarship = scholarships[0];

  if (!currentScholarship) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Current Scholarship
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          No current scholarship available.
        </p>
      </div>
    );
  }

  const formattedMonth = new Date(
    currentScholarship.year,
    currentScholarship.month - 1
  ).toLocaleString("default", { month: "long", year: "numeric" });

  const statusBadge = {
    "1": {
      text: "Approved",
      style:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
    "2": {
      text: "Pending",
      style:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    },
    "3": {
      text: "Rejected",
      style: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    },
  }[currentScholarship.status];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        Current Scholarship
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Scholarship for {formattedMonth}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm ${statusBadge?.style}`}
            >
              {statusBadge?.text ?? "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Amount
          </h4>
          <p className="text-xl font-medium text-gray-900 dark:text-white">
            ₹{parseFloat(currentScholarship.total_pay).toLocaleString()}
          </p>
        </div>
        <div>
          <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Days
          </h4>
          <p className="text-gray-900 dark:text-white">
            {currentScholarship.days} days
          </p>
        </div>
        <div>
          <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Details
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            Per Day: ₹
            {parseFloat(currentScholarship.total_pay_per_day).toFixed(2)}
          </p>
        </div>
      </div>

      {/* {currentScholarship.status === "2" && (
        <div className="mt-8 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-4">
            {approvalStages.map((stage, index) => (
              <React.Fragment key={stage.role}>
                <div className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      stage.status === "approved"
                        ? "bg-green-500"
                        : stage.status === "rejected"
                        ? "bg-red-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {stage.status !== "pending" && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={
                            stage.status === "approved"
                              ? "M5 13l4 4L19 7"
                              : "M6 18L18 6M6 6l12 12"
                          }
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stage.role}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {stage.status}
                    </div>
                  </div>
                </div>
                {index < approvalStages.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )} */}

      {currentScholarship.status === "2" && !currentScholarship.release && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => handleReleaseScholarship(currentScholarship.id)}
            disabled={releasing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {releasing ? "Releasing..." : "Release Scholarship"}
          </button>
        </div>
      )}

      {currentScholarship.status === "2" && currentScholarship.release && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-100 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300">
            This scholarship has been released and is pending approval.
          </p>
        </div>
      )}
    </div>
  );
};
