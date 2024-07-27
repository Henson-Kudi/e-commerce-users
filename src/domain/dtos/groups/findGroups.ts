export type GroupQuery = {
  id?: string | string[];
  name?: string;
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: { min?: Date | string | number; max?: Date | string | number };
  deletedBy?: string | string[];
  lastModifiedBy?: string | string[];

  roles?: string[]; //list of role ids
  users?: string[]; //list of user ids

  search?: string;
};

export type GroupQueryOptions = {
  withRoles?: boolean | 'true' | 'false';
  withUsers?: boolean | 'true' | 'false';
  limit?: number;
  skip?: number;
  page?: number;
  sort?: Record<keyof GroupQuery, 'asc' | 'desc'>;
};

export type QueryGroupParams = {
  filter?: GroupQuery;
  options?: GroupQueryOptions;
};
