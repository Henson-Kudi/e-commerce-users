export type RolePermissionQuery = {
  permissions?: string | string[];
  roles?: string | string[];
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  id?: string | string[];
};

export type RolePermissionOptions = {
  withRoles?: boolean;
  withPermissions?: boolean;
};

export type RolePermissionFilter = {
  filter?: RolePermissionQuery;
  options?: RolePermissionOptions;
};
