import ICreateUserDTO from '../../domain/dtos/user/ICreateUser';
import { QueryUserParams, UserQuery } from '../../domain/dtos/user/IFindUser';
import IUpdateUserDTO, {
  IUpdateUserEmailDTO,
  IUpdateUserPasswordDTO,
  IUpdateUserPhoneDTO,
} from '../../domain/dtos/user/IUpdateUser';
import messageBroker from '../../infrastructure/providers/messageBroker';
import passwordManager from '../../infrastructure/providers/passwordManager';
import tokenManager from '../../infrastructure/providers/tokenManager';
import InvitationsRepository from '../../infrastructure/repositories/postgres/invitationsRepository';
import UsersRepository from '../../infrastructure/repositories/postgres/usersRepository';
import UserTokensRepository from '../../infrastructure/repositories/postgres/userTokensRepository';
import CreateInvitation from '../usecases/invitations/createInvitation';
import GetInvitations from '../usecases/invitations/getInvitations';
import RemoveInvitation from '../usecases/invitations/removeInvitation';
import AddRolesToUser from '../usecases/user/addRolesToUser';
import ChangeUserPassword from '../usecases/user/changePassword';
import CreateUserUseCase from '../usecases/user/createUser';
import DeactivateAccount from '../usecases/user/deactivateAccount';
import DeleteAccount from '../usecases/user/deleteAccount';
import GetUser from '../usecases/user/getUser';
import GetUsers from '../usecases/user/getUsers';
import RemoveRolesFromUser from '../usecases/user/removeRolesFromUser';
import UpdateUser from '../usecases/user/updateUser';
import UpdateUserAccount from '../usecases/user/updateUserAccount';
import UpdateUserEmail from '../usecases/user/updateUserEmail';
import UpdateUserPhone from '../usecases/user/updateUserPhone';

export class UsersService {
  private readonly usersRepository = new UsersRepository();
  private readonly userTokensRepository = new UserTokensRepository();
  private readonly invitationsRepository = new InvitationsRepository();

  getUsers(params: QueryUserParams) {
    return new GetUsers(this.usersRepository).execute(params);
  }

  getUser(
    params: Omit<UserQuery, 'search'> & {
      id: string;
      withRoles?: boolean | 'true' | 'false';
      withGroups?: boolean | 'true' | 'false';
      withTokens?: boolean | 'true' | 'false';
    }
  ) {
    return new GetUser(this.usersRepository).execute(params);
  }

  createUser(params: ICreateUserDTO) {
    return new CreateUserUseCase(this.usersRepository, {
      messageBroker: messageBroker,
      passwordManager: passwordManager,
      tokenManager: tokenManager,
    }).execute(params);
  }

  changeUserPassword(params: IUpdateUserPasswordDTO) {
    return new ChangeUserPassword(
      {
        tokensRepository: this.userTokensRepository,
        usersRepository: this.usersRepository,
      },
      { messageBroker, passwordManager }
    ).execute(params);
  }

  deactivateAccount(params: { userId: string; actor: string }) {
    return new DeactivateAccount(
      this.usersRepository,
      this.userTokensRepository,
      { messageBroker }
    ).execute(params);
  }

  deleteAccount(params: { userId: string }) {
    return new DeleteAccount(this.usersRepository, this.userTokensRepository, {
      messageBroker,
    }).execute(params);
  }
  updateUser(params: {
    filter: Omit<UserQuery, 'search'> & {
      id: string;
    };
    data: IUpdateUserDTO;
    actor: string;
  }) {
    return new UpdateUser(this.usersRepository, { messageBroker }).execute(
      params
    );
  }

  updateMyAccount(
    params: IUpdateUserDTO & {
      id: string;
    }
  ) {
    return new UpdateUserAccount(this.usersRepository, {
      messageBroker,
    }).execute(params);
  }

  updateUserEmail(params: IUpdateUserEmailDTO) {
    return new UpdateUserEmail(
      {
        tokensRepository: this.userTokensRepository,
        usersRepository: this.usersRepository,
      },
      { messageBroker }
    ).execute(params);
  }

  updateUserPhone(params: IUpdateUserPhoneDTO) {
    return new UpdateUserPhone(
      {
        tokensRepository: this.userTokensRepository,
        usersRepository: this.usersRepository,
      },
      { messageBroker }
    ).execute(params);
  }

  addRolesToUser(params: { roles: string[]; actor: string; userId: string }) {
    return new AddRolesToUser(this.usersRepository, {
      messageBroker,
    }).execute(params);
  }

  removeRolesFromUser(params: {
    filter: UserQuery & {
      id: string;
    };
    data: {
      roles: string[];
      actor: string;
    };
  }) {
    return new RemoveRolesFromUser(this.usersRepository, {
      messageBroker,
    }).execute(params);
  }

  // Invitations
  inviteUser(params: {
    invitor: string;
    invitee: string;
    roles?: string[];
    expireAt?: Date;
  }) {
    return new CreateInvitation(
      this.invitationsRepository,
      this.usersRepository,
      messageBroker,
      tokenManager
    ).execute(params);
  }
  getInvitations(params: {
    filter?: {
      invitor?: string | string[];
      invitee?: string | string[];
    };
    page?: number;
    limit?: number;
  }) {
    return new GetInvitations(this.invitationsRepository).execute(params);
  }

  deleteInvitation(params: {
    filter?: {
      invitor?: string | string[];
    };
    id: string;
  }) {
    return new RemoveInvitation(
      this.invitationsRepository,
      messageBroker
    ).execute(params);
  }
}

export default new UsersService();
