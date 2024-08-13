import moment from 'moment';
import { GroupsWhereFilter } from '../../../infrastructure/repositories/protocols';
import { GroupQuery } from '../../../domain/dtos/groups/findGroups';

export default function setupGroupsQuery(
  query?: GroupQuery
): GroupsWhereFilter {
  const response: GroupsWhereFilter = {};

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

  if (query.deletedAt) {
    const deletedAt: Record<string, Date> = {};
    if (query.deletedAt.max && moment.isDate(query.deletedAt.max)) {
      deletedAt.lte = moment(query.deletedAt.max).endOf('day').toDate();
    }
    if (query.deletedAt.min && moment.isDate(query.deletedAt.min)) {
      deletedAt.gte = moment(query.deletedAt.min).startOf('day').toDate();
    }

    Object.keys(deletedAt).length && (response.deletedAt = deletedAt);
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

  if (query.isActive || query?.isActive === false) {
    response.isActive = query.isActive;
  }

  if (query.isDeleted || query.isDeleted === false) {
    response.isDeleted = query.isDeleted;
  }

  if (query.name) {
    response.name = {
      contains: query.name,
      mode: 'insensitive',
    };
  }

  if (query.deletedBy) {
    response.deletedById = Array.isArray(query.deletedBy)
      ? { in: query.deletedBy?.map((item) => item?.trim()) }
      : query.deletedBy;
  }

  if (query.lastModifiedBy) {
    response.lastModifiedById = Array.isArray(query.lastModifiedBy)
      ? { in: query.lastModifiedBy?.map((item) => item?.trim()) }
      : query.lastModifiedBy;
  }

  if (query.roles && query.roles?.filter((item) => item?.trim())?.length) {
    const roles = { in: query.roles?.map((item) => item?.trim()) };
    response.roles = {
      some: {
        id: roles,
      },
    };
  }

  if (query.users && query.users?.filter((item) => item?.trim())?.length) {
    const users = { in: query.users?.map((item) => item?.trim()) };
    response.users = {
      some: {
        id: users,
      },
    };
  }

  if (query.search) {
    /* eslint-disable no-console */
    console.log('search not implemented');
  }

  return response;
}
