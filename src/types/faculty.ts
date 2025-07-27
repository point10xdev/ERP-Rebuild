import type { Role } from "./roles";

export interface Faculty {
  id: number;
  roles: Role;

  name: string;
  email: string;
  phone_number: string;
  department: string;
  university: string;
  designation: string;
  profile_pic: string | null;
  date_of_birth: string;
  type_of_employee: string;
  nature_of_employment: string;
  address: string;
  user: number;
  
  // **************
  is_student: boolean;
    username?: string;
  first_name?: string;
  last_name?: string;
}
