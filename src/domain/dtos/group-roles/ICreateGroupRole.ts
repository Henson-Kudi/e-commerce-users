import { Prisma } from '@prisma/client';

type ICreateGroupRoleDTO = Omit<
  Prisma.GroupRoleCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'roles'
  | 'routes'
>;

export default ICreateGroupRoleDTO;
