import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { ROUTES } from "../../app/routes";
import { useAuth } from "./store/customHooks";
import { resetPassword } from "../../services/index";
import { showSuccess, showError } from "../../utils/toast";

export const ResetPasswordForm = () => {
  const { userId, token, username } = useParams<{
    userId: string;
    token: string;
    username: string;
  }>();
  const [params, setParams] = useState({ userId: "", token: "", username: "" });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userId && token) {
      setParams({ userId, token, username: username || "" });
      console.log("User ID:", userId);
      console.log("Token:", token);
    }
  }, [userId, token, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      showError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (!userId || !token) {
        throw new Error("Missing user ID or token in URL");
      }

      const res = await resetPassword(
        formData.newPassword,
        token,
        parseInt(userId)
      );

      console.log("Password reset response:", res);
      showSuccess("Password reset successful. Please login.");
      navigate(ROUTES.LOGIN); // Redirect to login after successful reset
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          {params && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Reset password for {params.username}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                id="name"
                type="text"
                disabled
                value={params?.username || ""}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                placeholder="Confirm your new password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
