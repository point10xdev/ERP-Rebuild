import React from "react";
import { StudentList } from "./StudentList";
import { useAuth } from "../../auth/store/customHooks";

export const MyStudentsPage = () => {
  // Get user object for department filtering or other logic if needed later
  const { user, selectedRole } = useAuth();
  const allowedRolesForScholarships = ["AD", "DEAN", "AC"];
  const canAccessSupervisedStudents = selectedRole === "FAC";
  const canAccessCollegeStudents =
    allowedRolesForScholarships.includes(selectedRole);
  const canAccessDepartmentStudents = selectedRole === "HOD";

  return (
    // The main container for the entire page, providing consistent padding and centering
    <div className="container mx-auto px-4 py-6">
      {/* Removed mb-8 and space-y-4 from here to reduce vertical spacing */}
      {/* Removed max-w-4xl from here to allow heading to align with full container width */}
      <div>
        {canAccessSupervisedStudents && (
          // Removed flex items-center space-x-3 for cleaner heading
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold pb-4">
            {" "}
            {/* Changed from font-extrabold to font-bold and text-black to text-gray-900 */}
            <span>Students under my supervision</span>
          </h1>
        )}

        {canAccessDepartmentStudents && (
          // Removed flex items-center space-x-3 for cleaner heading
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold pb-4">
            {" "}
            {/* Changed from font-extrabold to font-bold and text-black to text-gray-900 */}
            <span>
              Students in the{" "}
              {/* Removed underline decoration-wavy decoration-emerald-400 */}
              {/* Removed font-bold from here */}
              <span>{user?.department}</span> department
            </span>
          </h1>
        )}

        {canAccessCollegeStudents && (
          // Removed flex items-center space-x-3 for cleaner heading
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold pb-4">
            {" "}
            {/* Changed from font-extrabold to font-bold and text-black to text-gray-900 */}
            <span>
              Students across the{" "}
              {/* Removed underline decoration-wavy decoration-purple-400 */}
              {/* Removed font-bold from here */}
              <span>{user?.university}</span> college
            </span>
          </h1>
        )}
      </div>
      {/* StudentList will now render directly into this container's flow */}
      <StudentList />
    </div>
  );
};