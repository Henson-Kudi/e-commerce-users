export type GroupMembersQuery = {
  groups?: string | string[];
  users?: string | string[];
  createdAt?: { min?: Date | string | number; max?: Date | string | number };
  updatedAt?: { min?: Date | string | number; max?: Date | string | number };
  createdBy?: string | string[];
  id?: string | string[];
};

export type GroupMembersOptions = {
  withUsers?: boolean;
  withGroups?: boolean;
};

export type GroupMembersFilter = {
  filter?: GroupMembersQuery;
  options?: GroupMembersOptions;
};
