export interface User {
  id?: string;
  name: string;
  balance: number;
  // profile: IProfile,
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
}

export interface CreateUser {
  dto: {
    name: string;
    balance: number;
  };
}
export interface ChangeUser {
  id: string;
  dto: {
    name: string;
    balance: number;
  };
}

export interface userSubscribedTo {
  userId: string;
  authorId: string;
}
export interface subscribedToUser {
  userId: string;
  authorId: string;
}
