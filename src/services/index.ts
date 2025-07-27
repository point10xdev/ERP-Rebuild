import axios from "axios";
import config from "../types/conf.json";
import { logMessage } from "../utils/logger";
import { LoginPayload } from "../types/auth";
import { Role } from "../types/roles";
import { PostScholarshipPayload } from "../types/apiType";
const API = axios.create({
  baseURL: `${config.backend}/api`,
});

export const loginUser = async (payload: LoginPayload) => {
  try {
    const res = await API.post("/users/token/", payload);
    logMessage("info", "Login successful", "login", res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Login failed", "login", err);
    throw err;
  }
};

export const refreshUser = async (refresh: string) => {
  try {
    const res = await API.post("/users/token/refresh/", { refresh });
    logMessage("info", "refresh successful", "refreshUser", res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "refresh failed", "refreshUser", err);
    throw err;
  }
};

export const getStudent = async (
  faculty_id: number | null = null,
  department: string | null = null,
  university: string | null = null
) => {
  const context = "getStudent";

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (faculty_id !== null) queryParams.append("faculty", faculty_id.toString());
  if (department) queryParams.append("department", department);
  if (university) queryParams.append("university", university);

  const queryString = queryParams.toString();
  const url = `/users/student/${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await API.get(url);
    logMessage("info", "Student data fetched", context, res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to fetch student data", context, err);
    throw err;
  }
};

export const getFaculty = async (
  faculty_id: number | null = null,
  department: string | null = null,
  student: number | null = null,
  university: string | null = null
) => {
  const context = "getFaculty";

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (faculty_id !== null) queryParams.append("faculty", faculty_id.toString());
  if (department) queryParams.append("department", department);
  if (university) queryParams.append("university", university);
  if (student) queryParams.append("student", student.toString());

  const queryString = queryParams.toString();
  const url = `/users/faculty/${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await API.get(url);
    logMessage("info", "Student data fetched", context, res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to fetch student data", context, err);
    throw err;
  }
};

export const getScholarships = async ({
  id = null,
  scholar = null,
  faculty = null,
  role = null,
  type = null,
}: {
  id?: number | null;
  scholar?: number | null;
  faculty?: number | null;
  role?: Role | null;
  type?: string | null;
}) => {
  const context = "getScholarships";

  const queryParams = new URLSearchParams();
  if (id !== null) queryParams.append("id", id.toString());
  if (scholar !== null) queryParams.append("scholar", scholar.toString());
  if (faculty !== null) queryParams.append("faculty", faculty.toString());
  if (role !== null) queryParams.append("role", role);
  if (type !== null) queryParams.append("type", type);

  const queryString = queryParams.toString();
  const url = `/scholarships/manage${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await API.get(url);
    logMessage("info", "Scholarships fetched", context, res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to fetch scholarships", context, err);
    throw err;
  }
};

export const postScholarship = async (data: PostScholarshipPayload) => {
  const context = "postScholarship";

  if (!data.id) throw new Error("Scholarship ID is required.");

  if ("faculty" in data) {
    if (!data.role) throw new Error("Role is required for faculty.");
    if (!["accept", "reject"].includes(data.status)) {
      throw new Error("Status must be either 'accept' or 'reject'.");
    }
  }

  try {
    const res = await API.post("/scholarships/manage/", data);
    logMessage("info", "Scholarship posted", context, res.data);
    return res.data;
  } catch (err: any) {
    const errorMessage = err?.response?.data?.error || "Unknown error";
    logMessage("error", errorMessage, context, err);
    throw new Error(errorMessage);
  }
};

export const getStages = async ({
  id = null,
  type = null,
}: {
  id?: number | null;
  type?: "latest" | string | null;
}) => {
  const context = "getStages";

  const queryParams = new URLSearchParams();
  if (id !== null) queryParams.append("id", id.toString());
  if (type !== null) queryParams.append("type", type);

  const queryString = queryParams.toString();
  const url = `/scholarships/stage/${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await API.get(url);
    logMessage("info", "Stages fetched", context, res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to fetch stages", context, err);
    throw err;
  }
};

export const getMembers = async ({
  id = null,
  role = null,
}: {
  id?: number | null;
  role?: Role | null | "scholar";
}) => {
  const context = "getMembers";
  const queryParams = new URLSearchParams();
  if (role === null) console.error("Role is required");
  if (id !== null) queryParams.append("id", id.toString());
  if (role !== null) queryParams.append("role", role);
  const queryString = queryParams.toString();
  const url = `/users/members/${queryString ? `?${queryString}` : ""}`;
  try {
    const res = await API.get(url);
    logMessage("info", "Stages fetched", context, res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to fetch stages", context, err);
    throw err;
  }
};

export const updateStudentDetails = async (id: number, formData: FormData) => {
  const context = "updateStudentDetails";
  try {
    const res = await API.patch(`/users/student/${id}/`, formData);
    logMessage(
      "info",
      "Student details updated",
      "updateStudentDetails",
      res.data
    );
    return res.data;
  } catch (err) {
    logMessage("error", "Failed to update student details", context, err);
    throw err;
  }
};

export const updateBankDetails = async (
  id: number,
  account_no: string,
  ifsc: string
) => {
  const formData = new FormData();
  formData.append("account_no", account_no);
  formData.append("ifsc", ifsc);
  return updateStudentDetails(id, formData);
};

export const updateAddressDetails = async (
  id: number,
  present_address: string,
  current_address: string
) => {
  const formData = new FormData();
  formData.append("present_address", present_address);
  formData.append("current_address", current_address);
  return updateStudentDetails(id, formData);
};

export const updateProfilePicture = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("profile_pic", file);
  return updateStudentDetails(id, formData);
};

export const updateFacultyDetails = async (id: number, formData: FormData) => {
  try {
    const res = await API.patch(`/users/faculty/${id}/`, formData);
    logMessage(
      "info",
      "Faculty details updated",
      "updateFacultyDetails",
      res.data
    );
    return res.data;
  } catch (err) {
    logMessage(
      "error",
      "Failed to update faculty details",
      "updateFacultyDetails",
      err
    );
    throw err;
  }
};

export const exportReportData = async (
  userId: number,
  type: string,
  month: string // "YYYY-MM"
) => {
  try {
    const response = await API.get(`/exports/${type}`, {
      params: {
        user: userId,
        start_date: `${month}-01`,
      },
      responseType: "blob", // handle file
    });

    logMessage("info", "Export successful", "exportReportData", {
      userId,
      type,
      month,
    });

    return response.data;
  } catch (error) {
    logMessage("error", "Export failed", "exportReportData", error);
    throw error;
  }
};

export const logout = async (token: String) => {
  try {
    const res = await API.post("/users/logout/", { refresh: token });
    logMessage("info", "Logout successful", "Logout", res.data);
    return null;
  } catch (err) {
    logMessage("error", "Login failed", "login", err);
    throw err;
  }
};
export const resetPassword = async (
  password: string,
  token: string,
  id: number
) => {
  try {
    const res = await API.post("/users/reset-password/", {
      token: token,
      new_password: password,
      user: id, // Corrected from `user = id` to `user: id`
    });
    logMessage("info", "Reset password successful", "ResetPassword", res.data);
    return res;
  } catch (err) {
    logMessage("error", "Reset password failed", "ResetPassword", err);
    throw err;
  }
};

export const getid = async (mail: String) => {
  try {
    const res = await API.get(`/users/temp/getid/?mail=${mail}`);
    logMessage("info", "Logout successful", "Logout", res.data);
    return res.data;
  } catch (err) {
    logMessage("error", "Login failed", "login", err);
    throw err;
  }
};
