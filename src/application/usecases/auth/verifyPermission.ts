import {
  Errors,
  ResourceAccessLevels,
  ResourceAccessType,
  ResponseCodes,
  StaticRoles,
} from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import slugify from '../../../utils/slugifyString';
import combineUserPermissions, {
  determinAccessLevel,
} from '../../../utils/userPermissions';
import IUserRepository from '../../repositories/userRepository';
import UseCaseInterface from '../protocols';

export default class VerifyPermission
  implements
    UseCaseInterface<
      {
        userId: string;
        accessType: ResourceAccessType;
        module: string;
        resource: string;
        allowedRoles?: StaticRoles[];
      },
      IReturnValue<{
        userGroups?: string[];
        userRoles?: string[];
        accessLevel?: ResourceAccessLevels;
      }>
    >
{
  constructor(private readonly repo: IUserRepository) {}

  async execute(params: {
    userId: string;
    accessType: ResourceAccessType;
    module: string;
    resource: string;
    allowedRoles?: StaticRoles[];
  }): Promise<
    IReturnValue<{
      userGroups?: string[];
      userRoles?: string[];
      accessLevel?: ResourceAccessLevels;
    }>
  > {
    const allowedRoles = (params.allowedRoles ?? [])
      .concat([StaticRoles.SuperAdmin])
      .map((role) => slugify(role));
    // Check if user is super admin and return if true
    const isAllowedRole = await this.repo.findUnique({
      where: {
        id: params.userId,
        roles: {
          some: {
            slug: {
              in: allowedRoles,
            },
          },
        },
      },
    });

    if (isAllowedRole) {
      return {
        success: true,
        data: {
          accessLevel: ResourceAccessLevels.All,
        },
      };
    }

    const userPermissions = await this.repo.findUserWithRolesAndGroups({
      where: {
        id: params.userId,
      },
      include: {
        groups: {
          include: {
            roles: {
              include: {
                permissions: {
                  where: {
                    module: params.module.toUpperCase(),
                    isActive: true,
                    isDeleted: false,
                    resource: params.resource.toUpperCase(),
                  },
                },
              },
              where: {
                isActive: true,
                isDeleted: false,
              },
            },
          },
          where: {
            isActive: true,
            isDeleted: false,
          },
        },
        roles: {
          include: {
            permissions: {
              where: {
                module: params.module.toUpperCase(),
                resource: params.resource.toUpperCase(),
                isDeleted: false,
                isActive: true,
              },
            },
          },
          where: {
            isActive: true,
            isDeleted: false,
          },
        },
      },
    });

    const NotAuthorised = {
      success: false,
      error: new ErrorClass(
        'Unauthorized',
        ResponseCodes.UnAuthorised,
        null,
        Errors.UnAuthorised
      ),
      message: 'Unauthorized',
    };

    if (!userPermissions) {
      return NotAuthorised;
    }

    // const groups = userPermissions?.groups

    const groupPerms =
      userPermissions?.groups
        ?.map((group) => group?.roles?.map((role) => role?.permissions))
        ?.flat(5)
        .filter((item) => item != undefined) ?? [];

    const userPerms =
      userPermissions?.roles
        ?.map((role) => role?.permissions)
        .flat(5)
        ?.filter((item) => item != undefined) ?? [];

    const allPermissions = groupPerms?.concat(userPerms);

    const combinedPermissions = combineUserPermissions(
      allPermissions.map((item) => item.permission)
    );

    // if user does not have permission, return false (unauthorised)
    if (
      !combinedPermissions.userLevel.includes(params.accessType) &&
      !combinedPermissions.allLevel.includes(params.accessType) &&
      !combinedPermissions.groupLevel.includes(params.accessType)
    ) {
      return NotAuthorised;
    }

    // If user has all other access, then he can access the resource
    // If user has group access, he/she can only access resources created by those in the same group(s) he/she belongs in.
    // If  the user does not have group access but has personal access, then he/she can only access resources created by him/her
    const accessLevel = determinAccessLevel(
      combinedPermissions,
      params.accessType
    );

    if (accessLevel === ResourceAccessLevels.None) {
      return NotAuthorised;
    }

    const queryData: {
      userGroups?: string[]; // All groups user belongs to
      userRoles?: string[]; // A combination of group roles and user roles
      accessLevel?: ResourceAccessLevels; // Level of access to resource
    } = {
      accessLevel,
    };

    if (accessLevel === ResourceAccessLevels.Group) {
      const userGroups = userPermissions.groups?.map((group) => group.id) ?? [];
      const userRoles = userPermissions.roles?.map((role) => role.id) ?? [];

      queryData.userGroups = userGroups;
      queryData.userRoles = userRoles;
    }

    if (accessLevel === ResourceAccessLevels.User) {
      queryData.userRoles = userPermissions.roles?.map((role) => role.id) ?? [];
    }

    return {
      success: true,
      data: queryData,
      message: 'Permission',
    };
  }
}
