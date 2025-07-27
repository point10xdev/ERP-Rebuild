import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { AuthInitializer } from "../features/auth/store/AuthInitializer";
// import { PrivateRoute } from "../shared/components/PrivateRoute";

import { DarkModeProvider } from "../shared/DarkMode/DarkModeContext";

import { PublicLayout } from "../shared/layouts/PublicLayout";
// import { DashboardLayout } from "../shared/layouts/dashboard";

import Login from "../features/auth/Login";
// import {  ResetPassword, ResetPasswordForm, SetPasswordForm } from "../features/auth";


// import { HomePage } from "../features/dashboard/Home";
// import { ProfileRouter } from "../features/profile";

// import { MyStudentsPage } from "../features/faculty/myStudents/MyStudents";
// import DepartmentFacultyPage from "../features/faculty/departmentFaculty/DepartmentFaculty";

// import { ScholarshipPage } from "../features/faculty/scholarship/Scholarship";
// import { ManageScholarship } from "../features/faculty/scholarship/ManageScholarship";
// import { ApproveScholarship } from "../features/faculty/scholarship/ApproveScholarship";

// import { CurrentScholarship, PreviousScholarships } from "../features/students/scholarship";

// import { Export } from "../features/export/Export";

import { ROUTES } from "./routes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <RecoilRoot>
      <DarkModeProvider>
        <Router>
          <AuthInitializer />
          <ToastContainer />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />
            {/* <Route
              path={ROUTES.RESET_PASSWORD}
              element={
                <PublicLayout>
                  <ResetPassword />
                </PublicLayout>
              }
            />
            <Route
              path={ROUTES.RESET_PASSWORD_LINK}
              element={
                <PublicLayout>
                  <ResetPasswordForm />
                </PublicLayout>
              }
            />
            <Route
              path={ROUTES.SET_PASSWORD}
              element={
                <PublicLayout>
                  <SetPasswordForm />
                </PublicLayout>
              }
            /> */}

            {/* Dashboard routes - flat structure
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <HomePage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.MY_PROFILE}
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ProfileRouter />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.MY_STUDENTS}
              element={
                <PrivateRoute allowedRoles={["FAC", "HOD", "AD", "DEAN", "AC"]}>
                  <DashboardLayout>
                    <MyStudentsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.DEPARTMENT_FACULTY}
              element={
                <PrivateRoute allowedRoles={["HOD"]}>
                  <DashboardLayout>
                    <DepartmentFacultyPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.SCHOLARSHIP}
              element={
                <PrivateRoute allowedRoles={["FAC", "HOD", "AD", "DEAN"]}>
                  <DashboardLayout>
                    <ScholarshipPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.APPROVE_SCHOLARSHIP}
              element={
               <PrivateRoute allowedRoles={["FAC", "HOD", "AD", "DEAN"]}>
                  <DashboardLayout>
                    < ApproveScholarship/>
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.SCHOLARSHIP_MANAGEMENT}
              element={
                <PrivateRoute allowedRoles={["FAC", "HOD", "AD", "DEAN"]}>
                  <DashboardLayout>
                    < ManageScholarship/>
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path={ROUTES.STUDENT_SCHOLARSHIP}
              element={
                <PrivateRoute allowedRoles={["scholar"]}>
                  <DashboardLayout>
                    <CurrentScholarship />
                    <PreviousScholarships/>
                  </DashboardLayout>
                </PrivateRoute>
              }              
            />

            <Route
              path={ROUTES.EXPORT}
              element={
                <PrivateRoute allowedRoles={["AC"]}>
                  <DashboardLayout>
                    <Export />
                  </DashboardLayout>
                </PrivateRoute>
              }
            /> */}

            {/* Catch-all route for 404 - Optional but recommended */}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </RecoilRoot>
  );
}

export default App;