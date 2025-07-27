export const ROUTES = {

  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  RESET_PASSWORD_LINK: '/reset-password/:userId/:token',
  SET_PASSWORD: '/set-password/:userId/:token', 

  DASHBOARD: '/dashboard',

  /* Protected Routes */
  MY_PROFILE: '/dashboard/my-profile',

  MY_STUDENTS: '/dashboard/my-students',
  DEPARTMENT_FACULTY: '/dashboard/department-faculty',

  SCHOLARSHIP: '/dashboard/scholarship',
  APPROVE_SCHOLARSHIP: '/dashboard/scholarship/approve',
  SCHOLARSHIP_MANAGEMENT: '/dashboard/scholarship/scholarship-management',

  STUDENT_SCHOLARSHIP: '/dashboard/student/scholarship/',
  // PREVIOUS_SCHOLARSHIPS: '/dashboard/scholarship/previous',

  EXPORT: "/dashboard/export",
  
} as const;

  // SUPERVISOR: '/dashboard/supervisor',
  // STUDENT_VERIFICATION: '/dashboard/supervisor/student-verification',
  // SUBJECT_ASSIGNMENT: '/dashboard/supervisor/subject-assignment',
  // SEMESTER: '/dashboard/supervisor/semester',