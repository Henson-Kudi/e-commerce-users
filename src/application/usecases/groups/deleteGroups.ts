import IReturnValue from '../../../domain/valueObjects/returnValue';
import IMessageBroker from '../../providers/messageBroker';
import UseCaseInterface from '../protocols';
import kafkaTopics from '../../../utils/kafka-topics.json';
import logger from '../../../utils/logger';
import IGroupsRepository from '../../repositories/groupsRepository';
import { GroupQuery } from '../../../domain/dtos/groups/findGroups';
import setupGroupsQuery from '../utils/setupGroupsQuery';
import moment from 'moment';

export default class RemoveGroups
  implements
    UseCaseInterface<
      {
        filter: Omit<GroupQuery, 'search'> & { id: string | string[] };
        options?: { hardDelete?: boolean; actor: string };
      },
      IReturnValue<{ matchedCount: number }>
    >
{
  constructor(
    private readonly groupsRepository: IGroupsRepository,
    private readonly messageBroker: IMessageBroker
  ) {}

  async execute(params: {
    filter: Omit<GroupQuery, 'search'> & { id: string | string[] };
    options: { hardDelete?: boolean; actor: string };
  }): Promise<IReturnValue<{ matchedCount: number }>> {
    const { filter, options } = params;

    const query = setupGroupsQuery({
      ...filter,
      search: undefined,
    });

    // We need to ensure user has permission to delete all selected groups
    const count = await this.groupsRepository.count({ where: query });

    const IDLENGTH = Array.isArray(filter.id) ? filter.id.length : 1;

    if (count < IDLENGTH) {
      return {
        success: false,
        message:
          'You do not have enough permission to delete selected group(s)',
      };
    }

    const deleted = options?.hardDelete
      ? await this.groupsRepository.deleteMany({
          where: {
            id: { in: Array.isArray(filter.id!) ? filter.id : [filter.id!] },
          },
        })
      : await this.groupsRepository.softDeleteMany({
          where: query,
          data: {
            isDeleted: true,
            deletedAt: moment().toDate(),
            deletedById: options.actor,
            isActive: false,
          },
        });

    try {
      await this.messageBroker.publish({
        topic: options?.hardDelete
          ? kafkaTopics.groupsDeleted
          : kafkaTopics.groupsUpdated,
        messages: [
          {
            value: JSON.stringify({ data: filter.id }),
          },
        ],
      });
    } catch (err) {
      logger.error((err as Error).message, err);
    }

    if (!(deleted.matchedCount > 0)) {
      return { success: false, message: 'No groups found' };
    }

    return { success: true, data: deleted };
  }
}
