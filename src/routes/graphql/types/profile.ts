export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}
export interface CreateProfile {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  };
}
export interface ChangeProfile {
  id: string;
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
  };
}
