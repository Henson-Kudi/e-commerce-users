// This schema should be used to update user details by a user who has permissions to update user
type IUpdateUserDTO = {
  email?: string;
  emailVerified?: boolean;
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  photo?: string;
};

// User this to update non-sensitive data of user (A user updating his personal information)
export type IUpdateAccountDTO = {
  name?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  lastLoginLocation?: string;
  photo?: string;
};

// Use this to update only user email
export type IUpdateUserEmailDTO = {
  email: string;
  otpCode: string;
  id: string; // A user can only update his email
};

// Use this to update only user password
export type IUpdateUserPasswordDTO = {
  password: string;
  id: string;
  otpCode: string;
};

// Use this to update only user phone number
export type IUpdateUserPhoneDTO = {
  phone: string;
  otpCode: string;
  id: string;
};

export default IUpdateUserDTO;
