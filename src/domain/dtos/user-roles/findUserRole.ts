export type UserRoleQuery = {
  users?: string | string[];
  roles?: string | string[];
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  id?: string | string[];
};

export type UserRoleOptions = {
  withRoles?: boolean;
  withUsers?: boolean;
};

export type UserRoleFilter = {
  filter?: UserRoleQuery;
  options?: UserRoleOptions;
};
