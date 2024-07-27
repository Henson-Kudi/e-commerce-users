import { InvitationEntity } from '../../../domain/entities';
import { IReturnValueWithPagination } from '../../../domain/valueObjects/returnValue';
import IInvitationsRepository from '../../repositories/invitationsRepository';
import UseCaseInterface from '../protocols';
import Joi from 'joi';
import ErrorClass from '../../../domain/valueObjects/customError';
import { Errors, ResponseCodes } from '../../../domain/enums';

export default class GetInvitations
  implements
    UseCaseInterface<
      {
        filter?: {
          invitor?: string | string[];
          invitee?: string | string[];
        };
        page?: number;
        limit?: number;
      },
      IReturnValueWithPagination<InvitationEntity[]>
    >
{
  constructor(private readonly repository: IInvitationsRepository) {}

  async execute(params: {
    filter?: {
      invitor?: string | string[];
      invitee?: string | string[];
    };
    page?: number;
    limit?: number;
  }): Promise<IReturnValueWithPagination<InvitationEntity[]>> {
    try {
      const { filter } = params;

      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = {};

      if (filter?.invitee) {
        query.invitee = Array.isArray(filter.invitee)
          ? { in: filter.invitee }
          : filter.invitee;
      }

      if (filter?.invitor) {
        query.invitorId = Array.isArray(filter.invitor)
          ? { in: filter.invitor }
          : filter.invitor;
      }

      const totalCount = await this.repository.count({ where: query });

      const found = await this.repository.find({
        where: query,
        skip,
        take: limit,
      });

      return {
        success: true,
        data: {
          data: found,
          total: totalCount,
          page,
          limit,
        },
        message: 'Invitation created successfully',
      };
    } catch (err) {
      if (Joi.isError(err)) {
        return {
          success: false,
          message: err.details[0].message,
          error: new ErrorClass(
            err.details[0].message,
            ResponseCodes.ValidationError,
            err,
            Errors.ValidationError
          ),
        };
      }

      const error = err as Error;

      return {
        success: false,
        message: error.message,
        error: new ErrorClass(
          error.message,
          ResponseCodes.ServerError,
          null,
          Errors.ServerError
        ),
      };
    }
  }
}
