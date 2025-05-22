import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { Environment } from './environment.js';
import { UUIDType } from './uuid.js';
import { UserType } from './user-type.js';
import { MemberType, enumMemberId } from './member-type.js';
import { Profile } from './profile.js';

export const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'ProfileType',
  description: 'User profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: enumMemberId },
    user: {
      type: UserType,
      resolve: async (_parent: Profile, _, _context: Environment) => {
        return await _context.db.user.findFirst({ where: { id: _parent.userId } });
      },
    },
    memberType: {
      type: MemberType,
      resolve: async (_parent: Profile, _, _context: Environment) => {
        return await _context.db.memberType.findFirst({
          where: { id: _parent.memberTypeId },
        });
      },
    },
  }),
});
export const createProfileType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(enumMemberId) },
  }),
});
export const changeProfileType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: enumMemberId },
  }),
});
