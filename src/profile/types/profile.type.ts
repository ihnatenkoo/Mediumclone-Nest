import { UserType } from 'src/user/types/user.type';

export type ProfileType = Omit<
  UserType,
  'email' | 'articles' | 'favorites' | 'comments'
> & {
  following: boolean;
};
