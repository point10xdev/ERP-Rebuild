import { useEffect, useState } from "react";
import { useAuth } from "../../auth/store/customHooks";
import type { Faculty } from "../../../types/faculty";
import { getFaculty } from "../../../services/index";
import { Loader } from "lucide-react";
import conf from "../../../types/conf.json";
import { get } from "../../../utils/configFunction";

const DepartmentFaculty: React.FC = () => {
  const { user, selectedRole } = useAuth();
  const [teachingFaculty, setTeachingFaculty] = useState<Faculty[]>([]);
  const [nonTeachingFaculty, setNonTeachingFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isHOD = selectedRole === "HOD";
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        if (isHOD && user?.department) {
          const departmentFaculty = await getFaculty(null, user.department);
          setTeachingFaculty(
            departmentFaculty.filter((f: Faculty) => f.type_of_employee === "T")
          );
          setNonTeachingFaculty(
            departmentFaculty.filter(
              (f: Faculty) => f.type_of_employee === "NT"
            )
          );
        }
      } catch (err) {
        setError("Failed to fetch faculty data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isHOD && user?.department) {
      fetchFaculty();
    } else {
      setLoading(false); // Avoid indefinite loading if condition fails
    }
  }, [user, selectedRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        Department Faculty Members
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Phone Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Type of Employee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {teachingFaculty.length > 0 ? (
              teachingFaculty.map((faculty) => (
                <tr
                  key={faculty.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {faculty.profile_pic ? (
                        <img
                          className="h-10 w-10 rounded-full mr-4"
                          src={`${conf.backend}${faculty.profile_pic}`}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                          <span className="text-gray-500 dark:text-gray-300 font-medium">
                            {faculty.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {faculty.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {faculty.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {faculty.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {get(faculty.designation, conf.designation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {get(faculty.type_of_employee, conf.type_of_employee)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {user?.department
                    ? `No teaching faculty members found in ${user.department} department`
                    : "No department assigned to your account"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        Department Staff
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Phone Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Type of Employee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {nonTeachingFaculty.length > 0 ? (
              nonTeachingFaculty.map((faculty) => (
                <tr
                  key={faculty.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {faculty.profile_pic ? (
                        <img
                          className="h-10 w-10 rounded-full mr-4"
                          src={`${conf.backend}${faculty.profile_pic}`}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                          <span className="text-gray-500 dark:text-gray-300 font-medium">
                            {faculty.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {faculty.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {faculty.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {faculty.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {get(faculty.designation, conf.designation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {get(faculty.type_of_employee, conf.type_of_employee)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {user?.department
                    ? `No department staff found in ${user.department} department`
                    : "No department assigned to your account"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentFaculty;
