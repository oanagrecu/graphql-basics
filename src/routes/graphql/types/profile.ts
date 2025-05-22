export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: 0;
  userId: string;
  memberTypeId: string;
}
export interface CreateProfile {
  dto: {
    isMale: boolean;
    yearOfBirth: 0;
    userId: string;
    memberTypeId: string;
  };
}
export interface ChangeProfile {
  id: string;
  dto: {
    isMale: boolean;
    yearOfBirth: 0;
    memberTypeId: string;
  };
}
