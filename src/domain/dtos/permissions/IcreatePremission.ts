import { Prisma } from '@prisma/client';

type ICreatePermissionDTO = Omit<
  Prisma.PermissionCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'roles'
  | 'slug'
  | 'createdBy'
> & {
  roles?: string[]; // list of role ids
  createdBy: string;
};

export default ICreatePermissionDTO;
