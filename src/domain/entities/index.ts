import {
  User,
  Group,
  Permission,
  Role,
  Invitation,
  Token,
  Prisma,
} from '@prisma/client';

const roleWithPermissions = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    permissions: true,
  },
});

const groupWithRoles = Prisma.validator<Prisma.GroupDefaultArgs>()({
  include: {
    roles: roleWithPermissions,
  },
});

// 1: Define a type that includes the relations
export const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: roleWithPermissions,
    groups: groupWithRoles,
    tokens: true,
  },
});

export type RoleWithPermissions = Prisma.RoleGetPayload<
  typeof roleWithPermissions
>;
export type GroupWithRoles = Prisma.GroupGetPayload<typeof groupWithRoles>;

// 3: This type will include a user and all their posts
export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;

export {
  User as UserEntity,
  Group as GroupEntity,
  Permission as PermissionEntity,
  Role as RoleEntity,
  Invitation as InvitationEntity,
  Token as TokenEntity,
};
