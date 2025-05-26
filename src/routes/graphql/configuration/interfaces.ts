import { UUID } from 'crypto';

export interface postPri {
  dto: {
    title: string;
    content: string;
    authorId: UUID;
  };
}
export interface userPri {
  dto: {
    name: string;
    balance: number;
  };
}
export interface profilePri {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: UUID;
    userId: UUID;
  };
}

export interface changePostPri {
  title: string;
  content: string;
  authorId: UUID;
}
export interface changeUserPri {
  name: string;
  balance: number;
}
export interface changeProfilePri {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: UUID;
  userId: UUID;
}
interface MemberIt {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}
interface ProfileIt {
  id: UUID;
  isMale: boolean;
  yearOfBirth: number;
  userId: UUID;
  memberTypeId: 'basic' | 'business';
  memberType: MemberIt;
}
interface PostIt {
  id: UUID;
  title: string;
  content: string;
  authorId: UUID;
}
interface UserSubscribedToFrom {
  subscriberId?: UUID;
  authorId: UUID;
}
interface SubscribedToUser {
  subscriber: {
    id: UUID;
    name: string;
    balance: number;
    userSubscribedTo: UserSubscribedToFrom[];
  };
}
interface UserSubscribedTo {
  author: {
    id: UUID;
    name: string;
    balance: number;
    subscribedToUser: UserSubscribedToFrom[];
  };
}
export interface UniqueUser {
  id: UUID | null;
  name: string;
  balance: number;
  profile: null | ProfileIt;
  posts: PostIt[];
  subscribedToUser?: SubscribedToUser[] | null;
  userSubscribedTo?: UserSubscribedTo[] | null;
}
interface UserSubscribedToAnotherUser {
  authorId: UUID;
  subscriberId: UUID;
}
export interface OtherUser {
  id: UUID;
  name: string;
  balance: number;
  profile: null | ProfileIt;
  posts: PostIt[];
  userSubscribedTo: UserSubscribedToAnotherUser[];
  subscribedToUser: UserSubscribedToAnotherUser[];
}

export interface UserFindManyIt {
  profile: { include: { memberType: boolean } };
  posts: boolean;
  subscribedToUser?: boolean;
  userSubscribedTo?: boolean;
}
