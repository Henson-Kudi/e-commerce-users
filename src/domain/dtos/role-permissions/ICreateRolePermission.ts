import { Prisma } from '@prisma/client';

type ICreateRolePermissionDTO = Omit<
  Prisma.RolePermissionCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'roles'
  | 'routes'
>;

export default ICreateRolePermissionDTO;
