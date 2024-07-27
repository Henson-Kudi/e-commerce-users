export type RoleQuery = {
  id: string | string[];
  name: string;
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: { min?: Date | string | number; max?: Date | string | number };
  deletedBy?: string | string[];
  lastModifiedBy?: string | string[];
  users?: string[]; // list of user ids
  groups?: string[]; // list of group ids,
  permissions?: string[]; // list of permission ids

  search?: string;
};

export type RoleQueryOptions = {
  withUsers?: boolean | 'true' | 'false';
  withGroups?: boolean | 'true' | 'false';
  withPermissions?: boolean | 'true' | 'false';
  limit?: number;
  skip?: number;
  page?: number;
  sort?: Record<keyof RoleQuery, 'asc' | 'desc'>;
};

export type QueryRoleParams = {
  filter?: RoleQuery;
  options?: RoleQueryOptions;
};
