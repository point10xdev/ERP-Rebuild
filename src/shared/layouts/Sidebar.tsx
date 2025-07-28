import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserCircle,
  GraduationCap,
  Wallet,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  AlignJustify,
} from "lucide-react";
import { useAuth } from "../../features/auth/store/customHooks";
import { ROUTES } from "../../app/routes";
import type { Role } from "../../types/roles";

export const Sidebar = () => {
  const location = useLocation();
  const { user, selectedRole } = useAuth();

  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isScholarshipOpen, setIsScholarshipOpen] = useState(
    location.pathname.startsWith(ROUTES.SCHOLARSHIP)
  );

  // The sidebar is visually collapsed if 'isManuallyCollapsed' is true AND the mouse is NOT hovering over it.
  // Otherwise, it is visually expanded.
  const isVisuallyCollapsed = isManuallyCollapsed && !isHovering;

  // Toggles the manual collapse state of the sidebar
  const toggleSidebar = () => {
    setIsManuallyCollapsed(!isManuallyCollapsed);
    // When manually collapsing, we should also reset the hover state
    // so that the sidebar truly collapses even if the mouse is still over it.
    // If the user then moves the mouse out and back in, the hover effect will re-engage.
    setIsHovering(false);
  };

  // Toggles the scholarship dropdown menu
  const toggleScholarship = () => {
    setIsScholarshipOpen(!isScholarshipOpen);
  };

  // Effect to update scholarship dropdown state based on current path
  useEffect(() => {
    setIsScholarshipOpen(location.pathname.startsWith(ROUTES.SCHOLARSHIP));
  }, [location.pathname]);

  // Determine if the user has a student role
  const roles: Role[] | null =
    Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles : null;
  const isStudentRole = !roles || roles.length === 0;

  // Function to determine active class for navigation links
  const getActiveClass = (path: string, currentRole: Role | null) => {
    const isActivePath = location.pathname === path || location.pathname.startsWith(path);

    if (!isActivePath) {
      return "";
    }

    // Apply faculty-specific or student-specific active styles
    if (currentRole && ["FAC", "HOD", "AD", "DEAN", "AC"].includes(currentRole)) {
      return "bg-fac-pri text-white dark:bg-fac-pri-hover";
    } else {
      return "bg-stu-pri text-white dark:bg-stu-pri-hover";
    }
  };

  // Function to determine hover class for navigation links
  const getHoverClass = () => {
    // MODIFICATION: Always return the requested hover class
    return "hover:bg-gray-100 dark:hover:bg-gray-700";
  };

  // Role-based access control for sidebar items
  const allowedRolesForStudents = ["FAC", "HOD", "AD", "DEAN", "AC"];
  const allowedRolesForScholarships = ["FAC", "HOD", "AD", "DEAN"];

  const canAccessMyStudents =
    selectedRole !== null && allowedRolesForStudents.includes(selectedRole);
  const canAccessDepartmentFaculty = selectedRole === "HOD";
  const canAccessScholarships =
    selectedRole !== null && allowedRolesForScholarships.includes(selectedRole);
  const canAccessExport = selectedRole === "AC";

  // Determine base icon text color based on selected role
  const baseIconTextColor =
    selectedRole && ["FAC", "HOD", "AD", "DEAN", "AC"].includes(selectedRole)
      ? "text-fac-pri dark:text-fac-pri-hover-light"
      : "text-stu-pri dark:text-stu-pri-hover-light";

  // CSS classes for text transition when sidebar collapses/expands
  // MODIFICATION: Removed transition and delay for instant changes
  const getTextTransitionClasses = (isCollapsedState: boolean) =>
    `whitespace-nowrap ${isCollapsedState ? "opacity-0 max-w-0" : "opacity-100 max-w-full"}`;


  return (
    <div
      // ADDED: transition-all duration-300 ease-in-out for smooth light/dark mode changes
      className={`bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen transition-all duration-300 ease-in-out flex flex-col ${
        isVisuallyCollapsed ? "w-20" : "w-72"
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex justify-between items-center p-4">
        {/* AlignJustify icon now acts as the toggle button */}
        <button
          onClick={toggleSidebar}
          // Increased padding to accommodate larger icon
          className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          title={isManuallyCollapsed ? "Keep Menu Expanded" : "Collapse Menu"}
        >
          {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
          <AlignJustify className={`w-6 h-6 flex-none ${baseIconTextColor}`} />
        </button>

        {/* "Menu" text linking to Dashboard, always rendered for smooth transition */}
        <Link
          to={ROUTES.DASHBOARD}
          // Use 'isVisuallyCollapsed' here
          className={`flex items-center space-x-2 flex-1 ml-2 overflow-hidden
            ${baseIconTextColor} ${getTextTransitionClasses(isVisuallyCollapsed)}
          `}
        >
          <span className="font-medium text-md">Menu</span>
        </Link>
      </div>

      <nav className="mt-8 px-4 flex-1 space-y-2">
        {/* Dashboard Link */}
        <Link
          to={ROUTES.DASHBOARD}
          // Increased padding to accommodate larger icon
          className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.DASHBOARD, selectedRole)}
            ${getHoverClass()} overflow-hidden
          `}
          title="Home"
        >
          {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
          <Home className="w-6 h-6 flex-none" />
          {/* Use 'isVisuallyCollapsed' here */}
          <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
            Dashboard
          </span>
        </Link>

        {/* Profile Link */}
        <Link
          to={ROUTES.MY_PROFILE}
          // Increased padding to accommodate larger icon
          className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.MY_PROFILE, selectedRole)}
            ${getHoverClass()} overflow-hidden
          `}
          title="My Profile"
        >
          {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
          <UserCircle className="w-6 h-6 flex-none" />
          {/* Use 'isVisuallyCollapsed' here */}
          <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
            My Profile
          </span>
        </Link>

        {/* My Students Link (Conditionally rendered) */}
        {canAccessMyStudents && (
          <Link
            to={ROUTES.MY_STUDENTS}
            // Increased padding to accommodate larger icon
            className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.MY_STUDENTS, selectedRole)}
              ${getHoverClass()} overflow-hidden
            `}
            title="My Students"
          >
            {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
            <GraduationCap className="w-6 h-6 flex-none" />
            {/* Use 'isVisuallyCollapsed' here */}
            <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
              {selectedRole === "HOD"
                ? "Department Students"
                : selectedRole === "FAC"
                ? "My Students"
                : "Phd Students"}
            </span>
          </Link>
        )}
        {/* Department Faculty Management Link (Conditionally rendered) */}
        {canAccessDepartmentFaculty && (
          <Link
            to={ROUTES.DEPARTMENT_FACULTY}
            // Increased padding to accommodate larger icon
            className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.DEPARTMENT_FACULTY, selectedRole)}
              ${getHoverClass()} overflow-hidden
            `}
            title="Department Faculty"
          >
            {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
            <Users className="w-6 h-6 flex-none" />
            {/* Use 'isVisuallyCollapsed' here */}
            <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
              Department Staff
            </span>
          </Link>
        )}

        {/* Scholarship Section (Conditionally rendered with dropdown) */}
        {canAccessScholarships && (
          <div className="space-y-1">
            <div className="flex items-center overflow-hidden">
              <Link
                to={ROUTES.SCHOLARSHIP}
                // Increased padding to accommodate larger icon
                className={`flex-1 flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.SCHOLARSHIP, selectedRole)}
                  ${getHoverClass()}
                `}
              >
                {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
                <Wallet className="w-6 h-6 flex-none" />
                {/* Use 'isVisuallyCollapsed' here */}
                <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
                  Scholarship
                </span>
              </Link>
              {/* Only show dropdown arrow when not visually collapsed */}
              {!isVisuallyCollapsed && (
                <button
                  onClick={toggleScholarship}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isScholarshipOpen ? (
                    <ChevronUp className="w-4 h-4 flex-none" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-none" />
                  )}
                </button>
              )}
            </div>
            {/* Conditional rendering for dropdown with transition */}
            <div
              // MODIFICATION: Removed transition-all duration-300 ease-in-out for instant dropdown change
              className={`overflow-hidden ${
                // Dropdown should open if isScholarshipOpen AND not visually collapsed
                isScholarshipOpen && !isVisuallyCollapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/* Only render content when open AND not visually collapsed */}
              {isScholarshipOpen && !isVisuallyCollapsed && (
                <div className="ml-4 space-y-1">
                  <Link
                    to={ROUTES.APPROVE_SCHOLARSHIP}
                    // Increased padding to accommodate larger icon
                    className={`flex items-center gap-2 p-3 rounded-lg ${getActiveClass(ROUTES.APPROVE_SCHOLARSHIP, selectedRole)}
                      ${getHoverClass()}
                    `}
                  >
                    {/* Increased icon size from w-4 h-4 to w-5 h-5 */}
                    <CheckCircle className="w-5 h-5 flex-none" />
                    <span className="text-sm">Approve Scholarship</span>
                  </Link>
                  <Link
                    to={ROUTES.SCHOLARSHIP_MANAGEMENT}
                    // Increased padding to accommodate larger icon
                    className={`flex items-center gap-2 p-3 rounded-lg ${getActiveClass(ROUTES.SCHOLARSHIP_MANAGEMENT, selectedRole)}
                      ${getHoverClass()}
                    `}
                  >
                    {/* Increased icon size from w-4 h-4 to w-5 h-5 */}
                    <Users className="w-5 h-5 flex-none" />
                    <span className="text-sm">Scholarship Management</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Section for AC role (Conditionally rendered) */}
        {canAccessExport && (
          <Link
            to={ROUTES.EXPORT}
            // Increased padding to accommodate larger icon
            className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.EXPORT, selectedRole)}
              ${getHoverClass()} overflow-hidden
            `}
            title="Export"
          >
            {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
            <Download className="w-6 h-6 flex-none" />
            {/* Use 'isVisuallyCollapsed' here */}
            <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
              Export
            </span>
          </Link>
        )}

        {/* Student Scholarship Section (Conditionally rendered for student role) */}
        {isStudentRole && (
          <Link
            to={ROUTES.STUDENT_SCHOLARSHIP}
            // Increased padding to accommodate larger icon
            className={`flex items-center gap-2 p-4 rounded-lg ${getActiveClass(ROUTES.STUDENT_SCHOLARSHIP, null)}
              ${getHoverClass()} overflow-hidden
            `}
            title="Scholarship"
          >
            {/* Increased icon size from w-5 h-5 to w-6 h-6 */}
            <Wallet className="w-6 h-6 flex-none" />
            {/* Use 'isVisuallyCollapsed' here */}
            <span className={getTextTransitionClasses(isVisuallyCollapsed)}>
              Scholarship
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
};