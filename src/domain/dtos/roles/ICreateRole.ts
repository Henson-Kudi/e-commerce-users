import { Prisma } from '@prisma/client';

type ICreateRoleDTO = Omit<
  Prisma.RoleCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'users'
  | 'groups'
  | 'permissions'
  | 'deletedAt'
  | 'deletedBy'
  | 'slug'
  | 'createdBy'
> & {
  users?: string[];
  permissions?: string[];
  groups?: string[];
  createdBy: string;
};

export default ICreateRoleDTO;
