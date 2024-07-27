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

// USER GROUPS
export type UserGroupsDbClient = Prisma.UserGroupDelegate;
export type FindUserGroupQuery = Prisma.UserGroupFindManyArgs;
export type GroupMembersWhereFilter = Prisma.UserGroupWhereInput;
export type CreateUserGroupQuery = Prisma.UserGroupCreateArgs;
export type UpsertUserGroupQuery = Prisma.UserGroupUpsertArgs;
export type UpdateUserGroupQuery = Prisma.UserGroupUpdateArgs;
export type DeleteUserGroupQuery = Prisma.UserGroupDeleteManyArgs;

// USER ROLES
export type UserRolesDbClient = Prisma.UserRoleDelegate;
export type CreateUserRoleQuery = Prisma.UserRoleCreateArgs;
export type UpsertUserRoleQuery = Prisma.UserRoleUpsertArgs;
export type FindUserRoleQuery = Prisma.UserRoleFindManyArgs;
export type UserRolesWhereFilter = Prisma.UserRoleWhereInput;
export type UpdateUserRoleQuery = Prisma.UserRoleUpdateArgs;
export type DeleteUserRoleQuery = Prisma.UserRoleDeleteManyArgs;

// GROUP ROLES
export type GroupRolesDbClient = Prisma.GroupRoleDelegate;
export type CreateGroupRoleQuery = Prisma.GroupRoleCreateArgs;
export type UpsertGroupRoleQuery = Prisma.GroupRoleUpsertArgs;
export type FindGroupRoleQuery = Prisma.GroupRoleFindManyArgs;
export type FindOneGroupRoleQuery = Prisma.GroupRoleFindUniqueArgs;
export type GroupRolesWhereFilter = Prisma.GroupRoleWhereInput;
export type UpdateGroupRoleQuery = Prisma.GroupRoleUpdateArgs;
export type DeleteGroupRoleQuery = Prisma.GroupRoleDeleteManyArgs;

// INVITATIONS
export type InvitationsDbClient = Prisma.InvitationDelegate;
export type CreateInvitationQuery = Prisma.InvitationCreateArgs;
export type UpsertInvitationQuery = Prisma.InvitationUpsertArgs;
export type FindInvitationQuery = Prisma.InvitationFindManyArgs;
export type FindOneInvitationQuery = Prisma.InvitationFindUniqueArgs;
export type InvitationsWhereFilter = Prisma.InvitationWhereInput;
export type UpdateInvitationQuery = Prisma.InvitationUpdateArgs;
export type DeleteInvitationQuery = Prisma.InvitationDeleteManyArgs;

// ROLE PERMISSIONS
export type RolePermissionsDbClient = Prisma.RolePermissionDelegate;
export type CreateRolePermissionQuery = Prisma.RolePermissionCreateArgs;
export type UpsertRolePermissionQuery = Prisma.RolePermissionUpsertArgs;
export type FindRolePermissionQuery = Prisma.RolePermissionFindManyArgs;
export type FindUniqueRolePermissionQuery = Prisma.RolePermissionFindUniqueArgs;
export type RolePermissionsWhereFilter = Prisma.RolePermissionWhereInput;
export type UpdateRolePermissionQuery = Prisma.RolePermissionUpdateArgs;
export type DeleteRolePermissionQuery = Prisma.RolePermissionDeleteManyArgs;

// ROLE PERMISSIONS
export type UserTokensDbClient = Prisma.UserTokenDelegate;
export type FindUserTokenQuery = Prisma.UserTokenFindManyArgs;
export type CreateUserTokenQuery = Prisma.UserTokenCreateArgs;
export type UpdateUserTokenQuery = Prisma.UserTokenUpdateArgs;
export type UserTokenDeleteQuery = Prisma.UserTokenDeleteManyArgs;
