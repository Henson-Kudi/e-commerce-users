import { Prisma } from '@prisma/client';

type ICreateUserGroupDTO = Omit<
  Prisma.UserGroupCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'roles'
  | 'routes'
>;

export default ICreateUserGroupDTO;
