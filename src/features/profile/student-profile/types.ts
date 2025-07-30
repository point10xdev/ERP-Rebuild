import type { Scholar } from "../../../types/scholar";

export interface BankDetails {
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

export interface ProfileHeaderProps {
  user: Scholar;
  isHovering: boolean;
  onHoverChange: (isHovering: boolean) => void;
  onProfilePicChange: () => void;
}

export interface EnrolledDetailsProps {
  user: Scholar;
}

export interface ScholarshipDetailsProps {
  user: Scholar;
}

export interface BankDetailsProps {
  bankDetails: BankDetails;
  isEditing: boolean;
  onEditToggle: () => void;
  onBankDetailsSubmit: (e: React.FormEvent) => void;
  onBankDetailsChange: (field: keyof BankDetails, value: string) => void;
}

export interface AddressDetailsProps {
  user: Scholar;
}

export interface SupervisorDetailsProps {
  user: Scholar;
}
