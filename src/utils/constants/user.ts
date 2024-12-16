import {
  DefaultUserSelectedFields,
  SelectUserWithPassword as SelectUserWithPasswordType,
} from '../../domain/dtos/user/IFindUser';

export const DefaultUserFieldsToSelect: DefaultUserSelectedFields = {
  createdAt: true,
  email: true,
  emailVerified: true,
  groups: true,
  id: true,
  name: true,
  phone: true,
  phoneVerified: true,
  tokens: true,
  photo: true,
  roles: true,
  updatedAt: true,
};

export const SelectUserWithPassword: SelectUserWithPasswordType = {
  createdAt: true,
  email: true,
  emailVerified: true,
  groups: true,
  id: true,
  name: true,
  phone: true,
  phoneVerified: true,
  tokens: true,
  photo: true,
  roles: true,
  updatedAt: true,
  password: true,
};

export const SelectAllUserFields = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  phone: true,
  phoneVerified: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  isDeleted: true,
  deletedAt: true,
  deletedBy: true,
  googleId: true,
  appleId: true,
  photo: true,
  roles: true,
  groups: true,
  tokens: true,
  _count: true,
};
