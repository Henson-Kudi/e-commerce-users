import moment from 'moment';
import { UserQuery } from '../../../domain/dtos/user/IFindUser';
import { UsersWhereFilter } from '../../../infrastructure/repositories/protocols';

export default function setupUserQuery(query?: UserQuery): UsersWhereFilter {
  const response: UsersWhereFilter = {};

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

  if (query.deletedBy) {
    response.deletedById = Array.isArray(query.deletedBy)
      ? { in: query.deletedBy?.map((item) => item?.trim()) }
      : query.deletedBy;
  }

  if (query.email) {
    response.email = Array.isArray(query.email)
      ? { in: query.email?.map((item) => item?.trim()) }
      : query.email;
  }

  if (query.emailVerified || query.emailVerified === false) {
    response.emailVerified = query.emailVerified;
  }

  if (query.groups && query.groups?.filter((item) => item?.trim()).length) {
    const groups = { in: query.groups?.map((item) => item?.trim()) };
    response.groups = {
      some: {
        OR: [
          {
            id: groups,
          },
          {
            name: groups,
          },
        ],
      },
    };
  }

  if (query.id) {
    response.id = Array.isArray(query.id)
      ? { in: query.id?.map((item) => item?.trim()) }
      : query.id;
  }

  if (query.invitedById) {
    response.invitedById = Array.isArray(query.invitedById)
      ? { in: query.invitedById?.map((item) => item?.trim()) }
      : query.invitedById;
  }

  if (query.lastModifiedById) {
    response.lastModifiedById = Array.isArray(query.lastModifiedById)
      ? { in: query.lastModifiedById?.map((item) => item?.trim()) }
      : query.lastModifiedById;
  }

  if (query.isActive || query?.isActive === false) {
    response.isActive = query.isActive;
  }

  if (query.isDeleted || query.isDeleted === false) {
    response.isDeleted = query.isDeleted;
  }

  if (query.name) {
    response.name = query.name;
  }

  if (query.phone) {
    response.phone = Array.isArray(query.phone)
      ? { in: query.phone?.map((item) => item?.trim()) }
      : query.phone;
  }

  if (query.phoneVerified || query.phoneVerified === false) {
    response.phoneVerified = query.phoneVerified;
  }

  if (query.roles && query.roles?.filter((item) => item?.trim())?.length) {
    const roles = { in: query.roles?.map((item) => item?.trim()) };
    response.roles = {
      some: {
        OR: [
          {
            name: roles,
          },
          { id: roles },
        ],
      },
    };
  }

  if (query.search) {
    /* eslint-disable no-console */
    console.log('search not implemented');
  }

  return response;
}
