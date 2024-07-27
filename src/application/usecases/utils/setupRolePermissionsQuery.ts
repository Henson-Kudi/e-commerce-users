import moment from 'moment';
import { RolePermissionsWhereFilter } from '../../../infrastructure/repositories/protocols';
import { RolePermissionQuery } from '../../../domain/dtos/role-permissions/findRolePermissions';

export default function setupRolePermissionsQuery(
  query?: RolePermissionQuery
): RolePermissionsWhereFilter {
  const response: RolePermissionsWhereFilter = {};

  if (!query) return {};

  if (query.createdAt) {
    const createdAt: Record<string, Date> = {};
    if (query.createdAt.max && moment.isDate(query.createdAt.max)) {
      createdAt.lte = moment(query.createdAt.max).endOf('day').toDate();
    }
    if (query.createdAt.min && moment.isDate(query.createdAt.min)) {
      createdAt.gte = moment(query.createdAt.min).startOf('day').toDate();
    }

    Object.keys(createdAt).length && (response.createdAt = createdAt);
  }

  if (query.updatedAt) {
    const updatedAt: Record<string, Date> = {};
    if (query.updatedAt.max && moment.isDate(query.updatedAt.max)) {
      updatedAt.lte = moment(query.updatedAt.max).endOf('day').toDate();
    }
    if (query.updatedAt.min && moment.isDate(query.updatedAt.min)) {
      updatedAt.gte = moment(query.updatedAt.min).startOf('day').toDate();
    }

    Object.keys(updatedAt).length && (response.updatedAt = updatedAt);
  }

  if (query.id) {
    response.id = Array.isArray(query.id)
      ? { in: query.id?.map((item) => item?.trim()) }
      : query.id;
  }

  if (query.createdBy) {
    response.createdById = Array.isArray(query.createdBy)
      ? { in: query.createdBy?.map((item) => item?.trim()) }
      : query.createdBy;
  }

  if (query.permissions) {
    response.permissionId = Array.isArray(query.permissions)
      ? { in: query.permissions?.map((item) => item?.trim()) }
      : query.permissions;
  }

  if (query.roles) {
    response.roleId = Array.isArray(query.roles)
      ? { in: query.roles?.map((item) => item?.trim()) }
      : query.roles;
  }

  return response;
}
