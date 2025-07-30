import { useState, useEffect, useRef } from "react";
import { getScholarships } from "../../../services/index";
import { useAuth } from "../../auth/store/customHooks";
import conf from "../../../types/conf.json";
import Stepper from "../../../utils/Stepper";
import type { Scholarship } from "../../../types/scholarship";

const monthsDesc = [
  "January", // Changed order to be 0-indexed for direct mapping
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

const getMonthName = (monthNumber: number): string => {
  // Ensure monthNumber is within a valid range for 0-indexed monthsDesc array
  // We now directly use monthNumber as the index since monthsDesc is 0-indexed
  if (monthNumber >= 1 && monthNumber <= monthsDesc.length) {
    return monthsDesc[monthNumber - 1]; // Subtract 1 to get the correct 0-indexed array position
  }
  return ""; // Return empty string or handle invalid month numbers as appropriate
};

const getStatusText = (status: string): string => {
  switch (status) {
    case "1":
      return "approved";
    case "2":
      return "pending";
    case "3":
      return "rejected";
    default:
      return "pending";
  }
};

export const ManageScholarship = () => {
  const { user, selectedRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingScholarships, setPendingScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [editedDays, setEditedDays] = useState(0);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchScholarships = async () => {
      if (!user) {
        console.error("No user data available");
        setError("User information is missing. Please try logging in again.");
        setLoading(false);
        return;
      }
      if (!selectedRole) {
        console.error("No user role available");
        setError("User role is missing. Please try logging in again.");
        setLoading(false);
        return;
      }
      if (!user.id) {
        console.error("No user ID available");
        setError("User ID is missing. Please try logging in again.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getScholarships({
          faculty: user.id,
          role: selectedRole,
          // type: "role_pending",
        });

        const scholarshipsArray = response.scholarships || [];

        const data: Scholarship[] = scholarshipsArray.map((scholarship: any) => ({
          ...scholarship,
          selected: false,
          days: scholarship.days || 0, // Ensure 'days' is a number
        }));

        console.log(data);

        // Sort by year and month in descending order
        const sortedData = data.sort((a, b) => {
          // First compare years
          const yearDiff = b.year - a.year;
          if (yearDiff !== 0) return yearDiff;
          // If years are equal, compare months
          // Use the month number directly for sorting, as it's consistent
          return b.month - a.month; // Descending order
        });
        setPendingScholarships(sortedData);
      } catch (error) {
        console.error("Error fetching scholarships:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch scholarships. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [user, selectedRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setSelectedScholarship(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScholarshipClick = (sch: Scholarship) => {
    setSelectedScholarship(sch);
    setEditedDays(sch.days);
  };

  const getStatusTag = (status: string) => {
    const statusText = getStatusText(status);
    const base = "text-xs font-semibold px-2 py-1 rounded-full";
    if (statusText === "approved")
      return `${base} bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`;
    if (statusText === "rejected")
      return `${base} bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300`;
    return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300`;
  };

  const filteredScholarships = pendingScholarships.filter(
    (s) =>
      (filterMonth ? getMonthName(s.month) === filterMonth : true) &&
      (filterYear ? s.year.toString() === filterYear : true)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Manage Scholarships
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border px-3 py-1 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Months</option>
          {monthsDesc.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border px-3 py-1 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Years</option>
          {[...new Set(pendingScholarships.map((s) => s.year))]
            .sort((a, b) => b - a)
            .map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
        </select>
        {/* Removed Category Filter Backend doesnot return category */}
        {/* <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border px-3 py-1 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {scholarshipCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select> */}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {filteredScholarships.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No scholarships found.
            </p>
          ) : (
            filteredScholarships.map((sch) => (
              <div
                key={sch.id}
                onClick={() => handleScholarshipClick(sch)}
                className={`p-4 border rounded-md shadow-sm transition cursor-pointer ${
                  selectedScholarship?.id === sch.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium dark:text-white">
                      {sch.student_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getMonthName(sch.month)} {sch.year}
                    </p>
                  </div>
                  <span className={getStatusTag(sch.status)}>
                    {getStatusText(sch.status).charAt(0).toUpperCase() +
                      getStatusText(sch.status).slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2" ref={detailsRef}>
          {selectedScholarship ? (
            <>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Scholarship Details
                  </h3>
                </div>
                <p className="dark:text-gray-300">
                  <strong className="dark:text-white">Student:</strong>{" "}
                  {selectedScholarship.student_name}
                </p>
                <p className="dark:text-gray-300">
                  <strong className="dark:text-white">Month:</strong>{" "}
                  {getMonthName(selectedScholarship.month)}{" "}
                  {selectedScholarship.year}
                </p>
                <p className="dark:text-gray-300">
                  <strong className="dark:text-white">Amount:</strong> ₹
                  {parseFloat(selectedScholarship.total_pay).toLocaleString()}
                </p>
                <p className="dark:text-gray-300">
                  <strong className="dark:text-white">Per Day:</strong> ₹
                  {parseFloat(
                    selectedScholarship.total_pay_per_day
                  ).toLocaleString()}
                </p>
                <p className="dark:text-gray-300">
                  <strong className="dark:text-white">Status:</strong>{" "}
                  {getStatusText(selectedScholarship.status)
                    .charAt(0)
                    .toUpperCase() +
                    getStatusText(selectedScholarship.status).slice(1)}
                </p>
              </div>
              <Stepper
                scholarshipId={selectedScholarship.id as number}
              ></Stepper>
            </>
          ) : (
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md text-center text-gray-600 dark:text-gray-400">
              Select a scholarship to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};