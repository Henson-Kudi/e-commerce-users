import { Prisma } from '@prisma/client';

type ICreateGroupDTO = Omit<
  Prisma.GroupCreateInput,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isDeleted'
  | 'slug'
  | 'deletedAt'
  | 'deletedBy'
  | 'lastModifiedBy'
  | 'createdBy'
> & {
  users?: string[]; // list of user ids
  roles?: string[]; // list of role ids
  createdBy: string;
};

export default ICreateGroupDTO;
