import { Prisma } from '@prisma/client';

// USERS
export type UsersDbClient = Prisma.UserDelegate;
export type CreateUserQuery = Prisma.UserCreateArgs;
export type FindUsersQuery = Prisma.UserFindManyArgs;
export type FindOneUserQuery = Prisma.UserFindUniqueArgs;
export type UsersWhereFilter = Prisma.UserWhereInput;
export type UsersWhereUniqueFilter = Prisma.UserWhereUniqueInput;
export type UpdateUserQuery = Prisma.UserUpdateArgs;
export type DeleteUserQuery = Prisma.UserDeleteManyArgs;

// ROLES
export type RolesDbClient = Prisma.RoleDelegate;
export type CreateRoleQuery = Prisma.RoleCreateArgs;
export type FindRolesQuery = Prisma.RoleFindManyArgs;
export type FindOneRoleQuery = Prisma.RoleFindUniqueArgs;
export type RolesWhereFilter = Prisma.RoleWhereInput;
export type RolesWhereUniqueFilter = Prisma.RoleWhereUniqueInput;
export type UpdateRoleQuery = Prisma.RoleUpdateArgs;
export type DeleteRoleQuery = Prisma.RoleDeleteManyArgs;

// PERMISSIONS
export type PermissionsDbClient = Prisma.PermissionDelegate;
export type CreatePermissionQuery = Prisma.PermissionCreateArgs;
export type CreateUpsertPermissionQuery = Prisma.PermissionUpsertArgs;
export type FindPermissionQuery = Prisma.PermissionFindManyArgs;
export type PermissionsWhereFilter = Prisma.PermissionWhereInput;
export type PermissionsWhereUniqueFilter = Prisma.PermissionWhereUniqueInput;
export type UpdatePermissionQuery = Prisma.PermissionUpdateArgs;
export type DeletePermissionQuery = Prisma.PermissionDeleteManyArgs;

// GROUPS
export type GroupsDbClient = Prisma.GroupDelegate;
export type CreateGroupQuery = Prisma.GroupCreateArgs;
export type FindGroupQuery = Prisma.GroupFindManyArgs;
export type FindUniqueGroupQuery = Prisma.GroupFindUniqueArgs;
export type GroupsWhereFilter = Prisma.GroupWhereInput;
export type GroupsWhereUniqueFilter = Prisma.GroupWhereUniqueInput;
export type UpdateGroupQuery = Prisma.GroupUpdateArgs;
export type UpdateManyGroupsQuery = Prisma.GroupUpdateManyArgs;
export type DeleteGroupQuery = Prisma.GroupDeleteManyArgs;

// INVITATIONS
export type InvitationsDbClient = Prisma.InvitationDelegate;
export type CreateInvitationQuery = Prisma.InvitationCreateArgs;
export type UpsertInvitationQuery = Prisma.InvitationUpsertArgs;
export type FindInvitationQuery = Prisma.InvitationFindManyArgs;
export type FindOneInvitationQuery = Prisma.InvitationFindUniqueArgs;
export type InvitationsWhereFilter = Prisma.InvitationWhereInput;
export type UpdateInvitationQuery = Prisma.InvitationUpdateArgs;
export type DeleteInvitationQuery = Prisma.InvitationDeleteManyArgs;

// TOKENS
export type TokensDbClient = Prisma.TokenDelegate;
export type CreateTokenQuery = Prisma.TokenCreateArgs;
export type UpsertTokenQuery = Prisma.TokenUpsertArgs;
export type FindTokenQuery = Prisma.TokenFindManyArgs;
export type FindOneTokenQuery = Prisma.TokenFindUniqueArgs;
export type TokensWhereFilter = Prisma.TokenWhereInput;
export type UpdateTokenQuery = Prisma.TokenUpdateArgs;
export type DeleteTokenQuery = Prisma.TokenDeleteManyArgs;
