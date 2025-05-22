import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLFloat,
} from 'graphql';
import { Environment } from './environment.js';
import { ProfileType } from './profile-type.js';
import { Member } from './member.js';

export const enumMemberId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});
export const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Member',
  description: 'Member Type',
  fields: () => ({
    id: { type: enumMemberId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async ({ id }: Member, _context: Environment) => {
        try {
          return await _context.db.profile.findMany({ where: { memberTypeId: id } });
        } catch {
          return null;
        }
      },
    },
  }),
});
