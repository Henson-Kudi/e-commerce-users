import { Errors, ResponseCodes, StaticRoles } from '../../../domain/enums';
import ErrorClass from '../../../domain/valueObjects/customError';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import IMessageBroker from '../../providers/messageBroker';
import logger from '../../../utils/logger';
import IRoleRepository from '../../repositories/RoleRepository';
import moment from 'moment';
import { RoleQuery } from '../../../domain/dtos/roles/findRoles';
import setupRoleQuery from '../utils/setupRolesQuery';
import { RolesWhereUniqueFilter } from '../../../infrastructure/repositories/protocols';
import slugify from '../../../utils/slugifyString';

export default class DeleteRole
  implements
    UseCaseInterface<
      Omit<RoleQuery, 'search'> & {
        id: string;
        actor: string;
        hardDelete?: boolean;
      },
      IReturnValue<boolean>
    >
{
  constructor(
    private readonly repository: IRoleRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(
    params: Omit<RoleQuery, 'search'> & {
      id: string;
      actor: string;
      hardDelete?: boolean;
    }
  ): Promise<IReturnValue<boolean>> {
    try {
      const query = setupRoleQuery(params);

      // Ensure user has permissions to delete
      const count = await this.repository.count({ where: {
        ...query,
        slug: {
          notIn: [slugify(StaticRoles.SuperAdmin), slugify(StaticRoles.Editor), slugify(StaticRoles.Viewer)],
        }
      } });

      if (count < 1) {
        return {
          success: false,
          message: 'You do not have enough permissions to delete this resource',
          error: new ErrorClass(
            'You do not have enough permissions to delete this resource',
            ResponseCodes.Forbidden,
            null,
            Errors.Forbidden
          ),
        };
      }

      let deleted: boolean = false;

      if (params.hardDelete) {
        deleted = await this.repository.delete(params.id);
      } else {
        const isDeleted = await this.repository.softDelete({
          where: query as RolesWhereUniqueFilter,
          data: {
            isActive: false,
            isDeleted: true,
            deletedAt: moment().toDate(),
            deletedById: params.actor,
          },
        });

        deleted = isDeleted ? true : false;
      }

      // Publish role deleted message
      try {
        await this.messageBroker.publish({
          topic: kafkaTopics.roleDeleted,
          messages: [
            {
              value: JSON.stringify({
                data: { id: params.id },
              }),
            },
          ],
        });
      } catch (err) {
        logger.error((err as Error)?.message, err);
      }

      return {
        success: deleted,
        data: deleted,
        message: 'Role deleted successfully',
      };
    } catch (error) {
      const err = error as Error;

      return {
        success: false,
        message: err.message,
        error: new ErrorClass(
          Errors.ServerError,
          ResponseCodes.ServerError,
          err,
          Errors.ServerError
        ),
      };
    }
  }
}
