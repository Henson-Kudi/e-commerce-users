export type GroupRoleQuery = {
  groups?: string | string[];
  roles?: string | string[];
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  id?: string | string[];
};

export type GroupRoleOptions = {
  withRoles?: boolean;
  withGroups?: boolean;
};

export type GroupRoleFilter = {
  filter?: GroupRoleQuery;
  options?: GroupRoleOptions;
};
