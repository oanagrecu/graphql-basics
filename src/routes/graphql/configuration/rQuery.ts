import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { Environment } from '../types/environment.js';
import { User } from '../types/user.js';
import { UUIDType } from '../types/uuid.js';
import { POST } from '../types/post.js';
import { PostType } from '../types/post-type.js';
import { ProfileType } from '../types/profile-type.js';
import { UserType } from '../types/user-type.js';
import { Profile } from '../types/profile.js';
import { MemberType, enumMemberId } from '../types/member-type.js';
import { MemberIt } from '../types/member.js';

export const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, _context: Environment) => {
        return await _context.db.user.findMany();
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, _args: User, _context: Environment) => {
        const db = _context.db;
        return await db.user.findFirst({ where: { id: _args.id } });
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, _args: POST, _context: Environment) => {
        if (!_args || !_args.id) {
          throw new Error('Post ID is required');
        }
        const db = _context.db;
        return await db.post.findFirst({ where: { id: _args.id } });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, _context: Environment) => {
        const data = await _context.db.post.findMany();
        return data;
      },
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, _args: Profile, _context: Environment) => {
        const result = await _context.db.profile.findFirst({ where: { id: _args.id } });
        return result;
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, _context: Environment) => {
        const data = await _context.db.profile.findMany({});
        return data;
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(enumMemberId) },
      },
      resolve: async (_, _args: MemberIt, _context: Environment) => {
        return await _context.db.memberType.findFirst({ where: { id: _args.id } });
      },
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, __, _context: Environment) => {
        return await _context.db.memberType.findMany();
      },
    },
  }),
});
