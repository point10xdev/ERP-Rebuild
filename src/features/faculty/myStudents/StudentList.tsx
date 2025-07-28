import { useEffect, useState } from "react";

import { useAuth } from "../../auth/store/customHooks";

import type { Scholar } from "../../../types/scholar";

import { getStudent } from "../../../services/index";

import conf from "../../../types/conf.json";

import { Search, ListRestart } from 'lucide-react'; // Changed import from TimerReset to ListRestart

const get = (val: string, obj: Record<string, string>, ci = false) => {
  if (!val) return val;
  if (ci) {
    const match = Object.keys(obj).find(
      (k) => k.toLowerCase() === val.toLowerCase()
    );
    return match ? obj[match] : val;
  }
  return obj[val] || val;
};

export const StudentList = () => {
  const { user, selectedRole } = useAuth();
  const [students, setStudents] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // New state for category filter
  const [filterScholarshipStatus, setFilterScholarshipStatus] = useState(""); // New state for scholarship status filter
  const [departments, setDepartments] = useState<string[]>([]);
  const [admissionCategories, setAdmissionCategories] = useState<string[]>([]); // New state for unique admission categories


  const isFaculty = selectedRole === "FAC";
  const isHOD = selectedRole === "HOD";
  const isDean = selectedRole === "DEAN" || selectedRole === "AD";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let data: Scholar[] = [];

        if (!user || !selectedRole) return;

        setLoading(true); // Set loading to true before fetching data
        setError(null); // Clear any previous errors

        if (isDean) {
          data = await getStudent(null, null, user.university || null);
        } else if (isHOD) {
          data = await getStudent(null, user.department || null, null);
        } else if (isFaculty) {
          data = await getStudent(user.id, null, null);
        }

        setStudents(data);

        const uniqueDepartments = [
          ...new Set(data.map((s) => s.department).filter(Boolean)),
        ];
        if (uniqueDepartments.length > 0) {
          setDepartments(uniqueDepartments);
        }

        // Extract unique admission categories from data
        const uniqueAdmissionCategories = [
          ...new Set(data.map((s) => s.admission_category).filter(Boolean)),
        ];
        if (uniqueAdmissionCategories.length > 0) {
          setAdmissionCategories(uniqueAdmissionCategories);
        }

        // Reset filters when user or selectedRole changes
        setSearchTerm("");
        setFilterDepartment("");
        setFilterCategory("");
        setFilterScholarshipStatus("");

        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students");
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user?.id, user?.department, user?.university, selectedRole]);

  // Function to reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterCategory("");
    setFilterScholarshipStatus("");
  };


  if (loading) {
    return (
      <div className="p-4">
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Apply search and filters
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(searchLower) ||
      student.enroll.toLowerCase().includes(searchLower) ||
      student.registration.toLowerCase().includes(searchLower) ||
      student.department.toLowerCase().includes(searchLower) ||
      student.course.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower);

    const matchesDepartment =
      !filterDepartment || student.department === filterDepartment;

    const matchesCategory =
      !filterCategory || student.admission_category === filterCategory;

    const scholarshipStatus =
      student.admission_category === "INST_FEL" ? "Active" : "None";
    const matchesScholarshipStatus =
      !filterScholarshipStatus || scholarshipStatus === filterScholarshipStatus;


    return (
      matchesSearch &&
      matchesDepartment &&
      matchesCategory &&
      matchesScholarshipStatus
    );
  });

  return (
    <div className="py-6">
      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[300px] max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by name, enrollment, registration, department, course, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Filters are now always visible */}
        <div className="flex items-center space-x-2 ml-auto">
          <label
            htmlFor="departmentFilter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Filters :
          </label>
          <select
            id="departmentFilter"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* New Category Filter */}
          <label
            htmlFor="categoryFilter"
          >

          </label>
          <select
            id="categoryFilter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Categories</option>
            {Object.entries(conf.admission_category).map(([key, value]) => (
              <option key={key} value={key}>
                {value as string}
              </option>
            ))}
          </select>

          {/* New Scholarship Status Filter */}
          <label
            htmlFor="scholarshipStatusFilter"
          >
          </label>
          <select
            id="scholarshipStatusFilter"
            value={filterScholarshipStatus}
            onChange={(e) => setFilterScholarshipStatus(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="None">None</option>
          </select>

          {/* Reset Filters Icon */}
          <div
            onClick={handleResetFilters}
            title="Reset Filters" // Tooltip on hover
            className="p-2 cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
          >
            <ListRestart size={24} /> {/* Using the ListRestart icon */}
          </div>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Enrollment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Scholarship Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {searchTerm || filterDepartment || filterCategory || filterScholarshipStatus
                    ? "No students found matching your criteria"
                    : "No students available"}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {student.enroll}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {get(student.department, conf.college.departments)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {get(student.gender, conf.gender)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {get(student.admission_category, conf.admission_category)}
                  </td>
                  <td className="px-6 py-4">
                    {student.admission_category === "INST_FEL" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        None
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};