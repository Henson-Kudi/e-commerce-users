export type PermissionQuery = {
  id?: string | string[];
  modules?: string | string[];
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  deletedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  deletedBy?: string | string[];
  lastModifiedBy?: string | string[];
  isActive?: boolean;
  isDeleted?: boolean;
  roles?: string[]; //list of role names

  search?: string;
};

export type PermissionQueryOptions = {
  withRoles?: boolean | 'true' | 'false';
  limit?: number;
  skip?: number;
  page?: number;
  sort?: Record<keyof PermissionQuery, 'asc' | 'desc'>;
};

export type QueryPermissionParams = {
  filter?: PermissionQuery;
  options?: PermissionQueryOptions;
};
