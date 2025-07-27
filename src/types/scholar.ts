export interface Scholar {
  id: number;
  supervisor_name?: string;
  enroll: string;
  registration: string;
  name: string;
  email: string;
  phone_number: string;
  department: string | null;
  course: string;
  university: string;
  joining_date: string; // ISO date string  
  scholarship_basic: string; // returned as string from backend
  scholarship_hra: string; // same here
  profile_pic: string | null;
  present_address: string | null;
  current_address: string | null;
  gender: string;
  account_no: string | null;
  ifsc: string | null;
  admission_category: string;
  type_of_work: string;
  rf_category: string;
  user: number;
  supervisor: number | null;
  co_supervisor: number | null;
}