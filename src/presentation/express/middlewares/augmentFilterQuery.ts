import qs from 'qs';
import { NextFunction, Request, Response } from 'express';
import { buildExtendedQuery } from '../../../utils/userPermissions';
import {
  Errors,
  ResourceAccessLevels,
  ResponseCodes,
} from '../../../domain/enums';
import groupsService from '../../../application/services/groupsService';
import ErrorClass from '../../../domain/valueObjects/customError';

export default function augmentRequestQuery(field: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.query = req.query || {};

    const accessLevel = req.headers.accessLevel;

    // We want to get the memebers of the groups of this user and augment query filter by the users
    const groupsUsers: string[] = [];

    if (accessLevel === ResourceAccessLevels.Group) {
      const userGroups = (req.headers.userGroups ?? []) as string[];

      const users =
        (
          await groupsService.getGroups({
            filter: {
              id: userGroups,
            },
            options: {
              withUsers: true,
            },
          })
        ).data?.data
          ?.map((item) => item?.users?.map((user) => user?.id))
          ?.filter((userId) => userId != undefined)
          .flat(3) ?? [];

      groupsUsers.concat(users);
    }

    if (accessLevel === ResourceAccessLevels.User) {
      groupsUsers.concat([req.headers.userId as string]);
    }

    const newQuery = groupsUsers?.length
      ? buildExtendedQuery(req.query, field, groupsUsers)
      : req.query;

    if (accessLevel && !newQuery) {
      next(
        new ErrorClass(
          'Invalid queyr',
          ResponseCodes.BadRequest,
          { message: 'Failed to build query' },
          Errors.BadRequest
        )
      );
    }

    req.query = qs.parse(qs.stringify(newQuery));
    next();
  };
}
