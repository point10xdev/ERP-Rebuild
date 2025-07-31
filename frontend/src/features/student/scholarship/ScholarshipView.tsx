// ScholarshipView.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react"; // Import useMemo
import { useAuth } from "../../auth/store/customHooks";
import { getScholarships, postScholarship } from "../../../services/index";
import type { ScholarPost } from "../../../types/apiType";
import { showSuccess, showError } from "../../../utils/toast";
import { ScholarshipFilters } from "./ScholarshipFilters";
import Stepper from "../../../utils/Stepper";
import type { Scholarship } from "../../../types/scholarship";

export const ScholarshipView = () => {
  const { user, selectedRole } = useAuth();
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);

  // Filter states for previous scholarships
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [filteredPreviousScholarships, setFilteredPreviousScholarships] = useState<Scholarship[]>([]);

  const fetchAllScholarships = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await getScholarships({ scholar: user.id });
      setAllScholarships(response.scholarships || []);
    } catch (error) {
      console.error("Failed to fetch all scholarships:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch on component mount
  useEffect(() => {
    // Note: If this fix doesn't work, the original cleanup logic
    // should be re-added here. But the infinite loop is the most likely culprit.
    fetchAllScholarships();
  }, [user?.id, selectedRole, fetchAllScholarships]);

  const handleReleaseScholarship = async (scholarshipId: number) => {
    if (!user?.id) {
      window.alert("User not found. Please log in again.");
      return;
    }

    setReleasing(true);
    try {
      const payload: ScholarPost = {
        id: scholarshipId,
        scholar: String(user.id),
      };

      await postScholarship(payload);
      showSuccess("Scholarship released successfully");

      // After successfully releasing, refetch all scholarships to update both sections
      await fetchAllScholarships();
    } catch (error) {
      console.error("Failed to post scholarship:", error);
      showError(
        error instanceof Error
          ? error.message
          : `Error While Releasing the Scholarship contact Administrator Scholarship id ${scholarshipId}`
      );
    } finally {
      setReleasing(false);
    }
  };

  // FIX: Memoize derived state to prevent re-creation on every render
  const currentScholarship = useMemo(
    () => allScholarships.find((s) => s.status === "2" && s.release === false),
    [allScholarships]
  );
  
  const previousScholarships = useMemo(
    () => allScholarships.filter((s) => s.release === true || s.status !== "2"),
    [allScholarships]
  );

  // Apply filters to previous scholarships whenever previousScholarships or filter criteria change
  useEffect(() => {
    let filtered = previousScholarships;

    if (selectedMonth) {
      filtered = filtered.filter(
        (sch) => sch.month.toString() === selectedMonth
      );
    }

    if (selectedYear) {
      filtered = filtered.filter((sch) => sch.year.toString() === selectedYear);
    }

    setFilteredPreviousScholarships(filtered);
  }, [selectedMonth, selectedYear, previousScholarships]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Scholarship Section */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          Current Scholarship
        </h2>
        {currentScholarship ? (
          <>
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Scholarship for{" "}
                    {new Date(currentScholarship.year, currentScholarship.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      {
                        "1": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                        "2": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
                        "3": "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
                      }[currentScholarship.status] ?? "Unknown"
                    }`}
                  >
                    {{
                      "1": "Approved",
                      "2": "Pending",
                      "3": "Rejected",
                    }[currentScholarship.status] ?? "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</h4>
                <p className="text-xl font-medium text-gray-900 dark:text-white">
                  ₹{parseFloat(currentScholarship.total_pay).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Days</h4>
                <p className="text-gray-900 dark:text-white">
                  {currentScholarship.days} days
                </p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Details</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Per Day: ₹{parseFloat(currentScholarship.total_pay_per_day).toFixed(2)}
                </p>
              </div>
            </div>

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
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No current scholarship available.
          </p>
        )}
      </div>

      {/* Previous Scholarships Section */}
      <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          Previous Scholarships
        </h2>

        {previousScholarships.length > 0 ? (
          <>
            <ScholarshipFilters
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />

            <div className="space-y-4">
              {filteredPreviousScholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Scholarship for{" "}
                      {new Date(sch.year, sch.month - 1).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        sch.status === "1"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : sch.status === "2"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {sch.status === "1"
                        ? "Approved"
                        : sch.status === "2"
                        ? "Pending"
                        : "Rejected"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</h4>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{parseFloat(sch.total_pay).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</h4>
                      <p className="text-gray-900 dark:text-white">{sch.days} days</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Details</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Per Day: ₹{parseFloat(sch.total_pay_per_day).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {sch.status === "2" && (
                    <div className="px-10 sm:px-12">
                      <Stepper scholarshipId={sch.id as number} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            You don't have any previous scholarships.
          </p>
        )}
      </div>
    </div>
  );
};