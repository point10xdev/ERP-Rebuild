export interface BaseData {
  id: string;
}

export interface ScholarPost extends BaseData {
  scholar: string;
}

export interface FacultyPost extends BaseData {
  faculty: string;
  role: "FAC" | "HOD" | "AD" | "DEAN";
  status: "accept" | "reject";
  comment?: string;
  deducted_days?: number;
}

export type PostScholarshipPayload = ScholarPost | FacultyPost;
