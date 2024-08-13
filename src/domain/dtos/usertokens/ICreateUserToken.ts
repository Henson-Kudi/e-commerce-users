import { Prisma } from '@prisma/client';

type ICreateUserTokenDTO = Omit<Prisma.TokenCreateInput, 'id' | 'user'> & {
  userId: string;
};

export default ICreateUserTokenDTO;
