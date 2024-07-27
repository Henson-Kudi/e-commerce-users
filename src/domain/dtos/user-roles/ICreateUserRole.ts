import { Prisma } from '@prisma/client';

type ICreateUserRoleDTO = Omit<
  Prisma.UserRoleCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'roles'
  | 'routes'
>;

export default ICreateUserRoleDTO;
