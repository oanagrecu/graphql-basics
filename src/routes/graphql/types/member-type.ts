import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLFloat,
} from 'graphql';
import { Environment } from './environment.js';
import { ProfileType } from './profile-type.js';
import { MemberIt } from './member.js';

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  description: 'Member Type',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async ({ id }: MemberIt, _context: Environment) => {
        try {
          return await _context.db.profile.findMany({ where: { memberTypeId: id } });
        } catch {
          return [];
        }
      },
    },
  }),
});
