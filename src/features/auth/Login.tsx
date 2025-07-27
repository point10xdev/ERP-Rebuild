import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { Loader, GraduationCap, User } from "lucide-react";
import { useAuth } from "./store/customHooks";
import { showError } from "../../utils/toast";
import type { LoginPayload } from "../../types/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<LoginPayload['type']>("scholar");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      showError("Please enter both username and password");
      return;
    }

    try {
      await login({ username, password, type: loginType });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700">
        <div className="flex flex-col items-center">
          {/* Icon color dynamically changes based on loginType using custom colors */}
          {loginType === "scholar" ? (
            <User className="w-12 h-12 text-stu-pri dark:text-stu-pri mb-4" />
          ) : (
            <GraduationCap className="w-12 h-12 text-fac-pri dark:text-fac-pri mb-4" />
          )}
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Welcome to ERP Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please select your login type
          </p>
        </div>

        {/* Sliding Toggle */}
        <div className="relative flex justify-center mb-6">
          <div className="relative inline-flex items-center border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-sm">
            {/* Sliding background */}
            <div
              className={`absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] rounded-full transition-transform duration-300 ease-in-out ${
                loginType === "scholar"
                  ? "translate-x-0 bg-stu-pri dark:bg-stu-pri"
                  : "translate-x-full bg-fac-pri dark:bg-fac-pri"
              }`}
            />

            {/* Scholar Button */}
            <button
              onClick={() => setLoginType("scholar")}
              className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ease-in-out ${
                loginType === "scholar"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Student</span>
              </div>
            </button>

            {/* Faculty Button */}
            <button
              onClick={() => setLoginType("FAC")}
              className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ease-in-out ${
                loginType === "FAC"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Faculty</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {loginType === "scholar" ? "Student ID" : "Faculty ID"}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                loginType === "scholar"
                  ? "focus:ring-stu-pri dark:focus:ring-stu-pri"
                  : "focus:ring-fac-pri dark:focus:ring-fac-pri"
              }`}
              placeholder={
                loginType === "scholar"
                  ? "Enter Student ID"
                  : "Enter Faculty ID"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                loginType === "scholar"
                  ? "focus:ring-stu-pri dark:focus:ring-stu-pri"
                  : "focus:ring-fac-pri dark:focus:ring-fac-pri"
              }`}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                loginType === "scholar"
                  ? "bg-stu-pri dark:bg-stu-pri hover:bg-stu-pri-hover dark:hover:bg-stu-pri-hover"
                  : "bg-fac-pri dark:bg-fac-pri hover:bg-fac-pri-hover dark:hover:bg-fac-pri-hover"
              }`}
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to={ROUTES.RESET_PASSWORD}
              className={`text-sm ${
                loginType === "scholar"
                  ? "text-stu-pri hover:text-stu-pri-hover dark:hover:text-stu-pri-hover-light"
                  : "text-fac-pri hover:text-fac-pri-hover dark:hover:text-fac-pri-hover-light"
              }`}
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;