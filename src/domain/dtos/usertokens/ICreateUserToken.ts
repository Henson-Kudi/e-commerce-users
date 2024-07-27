import { Prisma } from '@prisma/client';

type ICreateUserTokenDTO = Omit<Prisma.UserTokenCreateInput, 'id' | 'user'> & {
  userId: string;
};

export default ICreateUserTokenDTO;
