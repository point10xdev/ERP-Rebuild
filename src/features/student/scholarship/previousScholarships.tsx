import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/store/customHooks";
import { getScholarships } from "../../../services/index";
import type { Scholarship } from "../../../types/scholarship";
import { ScholarshipFilters } from "./ScholarshipFilters";
import Stepper from "../../../utils/Stepper";
export const PreviousScholarships = () => {
  const { user, selectedRole } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<
    Scholarship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Generate year options (last 5 years)

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;

      try {
        // Step 1: Fetch scholarships
        const response = await getScholarships({
          scholar: user.id,
          type: "previous",
        });

        const previousScholarships = response.scholarships;
        setScholarships(previousScholarships);
        setFilteredScholarships(previousScholarships);
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, selectedRole]);

  // Filter scholarships when month or year changes
  useEffect(() => {
    let filtered = scholarships;

    if (selectedMonth) {
      filtered = filtered.filter(
        (sch) => sch.month.toString() === selectedMonth
      );
    }

    if (selectedYear) {
      filtered = filtered.filter((sch) => sch.year.toString() === selectedYear);
    }

    setFilteredScholarships(filtered);
  }, [selectedMonth, selectedYear, scholarships]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <>
        {/* <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Previous Scholarships
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          You don't have any previous scholarships.
        </p>
      </div> */}
      </>
    );
  }

  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        Previous Scholarships
      </h2>

      <ScholarshipFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <div className="space-y-4">
        {filteredScholarships.map((sch) => (
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
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Amount
                </h4>
                <p className="font-medium text-gray-900 dark:text-white">
                  ₹{parseFloat(sch.total_pay).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Duration
                </h4>
                <p className="text-gray-900 dark:text-white">{sch.days} days</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Details
                </h4>
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

      {/* Page Switcher */}
      {/* <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">5</span> of{" "}
            <span className="font-medium">{filteredScholarships.length}</span>{" "}
            results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Previous
          </button>
          <div className="flex items-center space-x-1">
            <button className="relative inline-flex items-center rounded-md border border-purple-500 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-300">
              1
            </button>
            <button className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
              2
            </button>
            <button className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
              3
            </button>
          </div>
          <button className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
            Next
          </button>
        </div>
      </div> */}
    </div>
  );
};
