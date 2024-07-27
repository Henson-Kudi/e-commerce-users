import { Prisma } from '@prisma/client';

export type DefaultUserSelectedFields = Omit<
  Prisma.UserSelect,
  | 'password'
  | 'isActive'
  | 'isDeleted'
  | 'appleId'
  | 'googleId'
  | 'deletedAt'
  | 'deletedBy'
  | 'lastLoginIp'
  | '_count'
>;

export type SelectUserWithPassword = Omit<
  Prisma.UserSelect,
  | 'isActive'
  | 'isDeleted'
  | 'appleId'
  | 'googleId'
  | 'deletedAt'
  | 'deletedBy'
  | 'lastLoginIp'
>;

export type SelectUserFields = Omit<
  Prisma.UserSelect,
  | 'isActive'
  | 'isDeleted'
  | 'appleId'
  | 'googleId'
  | 'deletedAt'
  | 'deletedBy'
  | 'lastLoginIp'
>;

export type UserQuery = {
  id?: string | string[];
  email?: string | string[];
  emailVerified?: boolean;
  name?: string;
  phone?: string | string[];
  phoneVerified?: boolean;
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: { min?: Date | string | number; max?: Date | string | number };
  deletedBy?: string | string[];
  roles?: string[]; //list of role names
  groups?: string[]; // list of group names
  search?: string;
  invitedById?: string | string[];
  lastModifiedById?: string | string[];
};

export type UserQueryOptions = {
  withRoles?: boolean | 'true' | 'false';
  withGroups?: boolean | 'true' | 'false';
  withTokens?: boolean | 'true' | 'false';
  limit?: number;
  skip?: number;
  page?: number;
  selectFields?: SelectUserFields;
  sort?: Record<keyof UserQuery, 'asc' | 'desc'>;
};

export type QueryUserParams = {
  filter?: UserQuery;
  options?: UserQueryOptions;
};
