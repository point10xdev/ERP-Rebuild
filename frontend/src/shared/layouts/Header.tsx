import { Link, useNavigate } from "react-router-dom";
import { UserCircle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../features/auth/store/customHooks";
import { ROUTES } from "../../app/routes";
import { useState, useEffect } from "react";
import type { Role } from "../../types/roles"; // Updated import name
import { showSuccess, showError } from "../../utils/toast";
import { Button } from "../../lib/components/ui/moving-border"; // Import the Button component


// Mapping backend roles to user-friendly display names
const roleDisplayMap: Record<Role, string> = {
  FAC: "Faculty",
  HOD: "HOD",
  AD: "Associate Dean",
  DEAN: "Dean",
  AC: "Accounts",
  scholar: "Scholar",
};

// Custom Tooltip
const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export const Header = () => {
  // Use only the useAuth hook - it handles everything through authService
  const {
    user,
    loading,
    selectedRole,
    setSelectedRole,
    logout // Use logout from the hook instead of direct authService call
  } = useAuth();

  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get roles from user object
  const roles = Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles : null;

  useEffect(() => {
    if (!user) return;

    // Set profile image if available
    if (user.profile_pic) {
      setProfileImage(user.profile_pic);
    }

    // Set default role if needed
    if (roles && roles.length > 0) {
      if (!selectedRole || !roles.includes(selectedRole)) {
        setSelectedRole(roles[0]);
      }
    }
  }, [user, roles, selectedRole, setSelectedRole]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);

    try {
      // Use logout from useAuth hook - it handles authService call + state clearing
      await logout();

      showSuccess("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      showError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Role Selector */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            <div className="relative">
              {roles && roles.length > 0 ? ( // Added check for roles.length > 0 for clarity, though `roles` being truthy usually implies this.
                <>
                  <Button
                     borderRadius="0.7rem"
                     onClick={(e) => {
                       e.stopPropagation();
                       setIsOpen(!isOpen);
                     }}
                     containerClassName="h-auto w-auto p-[1px] text-xl"
                     borderClassName="h-20 w-20 bg-[radial-gradient(#F43F5E_40%,transparent_60%)] opacity-[0.8]"
                     className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border-none">
                    {selectedRole
                      ? roleDisplayMap[selectedRole] || selectedRole
                      : "Select Role"}
                    <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>

                  {isOpen && (
                    <ul className="absolute left-0 mt-2 w-44 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 border dark:border-gray-700">
                      {roles.map((role) => (
                        <li
                          key={role}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(role);
                          }}
                          // Adjusted padding and font size for larger list items
                          className={`px-5 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 first:rounded-t-lg last:rounded-b-lg ${
                            role === selectedRole
                              ? "font-semibold bg-gray-100 dark:bg-gray-700"
                              : ""
                          }`}
                        >
                          {roleDisplayMap[role] || role}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // --- Start of changes for Scholar role ---
                <Button
                  borderRadius="0.7rem" // Consistent border radius
                  // No onClick for Scholar as it's not a dropdown
                  containerClassName="h-auto w-auto p-[1px] text-xl"
                  borderClassName="h-20 w-20 bg-[radial-gradient(#F43F5E_40%,transparent_60%)] opacity-[0.8]" // Consistent border style
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg border-none" // Consistent styling, added border-none
                >
                  Scholar
                </Button>
                // --- End of changes for Scholar role ---
              )}
            </div>
          </h2>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome,{" "}
                  <span className="font-medium">{user?.name || "Guest"}</span>
                </span>

                <Link
                  to={ROUTES.MY_PROFILE}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={() => setProfileImage(null)}
                    />
                  ) : (
                    <UserCircle className="w-8 h-8" />
                  )}
                </Link>

                <Tooltip text="Logout">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <LogOut
                      className={`w-5 h-5 ${isLoggingOut ? 'animate-spin' : ''}`}
                    />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};