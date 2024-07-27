type ICreateUserDTO = {
  email: string;
  name: string;
  phone: string;
  password?: string;
  googleId?: string;
  appleId?: string;
  photo?: string;
  invitedById?: string;
  roles?: string[];
  groups?: string[];
  invitorToken?: string;
};

export default ICreateUserDTO;
