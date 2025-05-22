import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { Environment } from '../types/environment.js';
import { ChangePostType, PostType } from '../types/post-type.js';
import { UserType, changeUserType } from '../types/user-type.js';
import { ChangeUser, CreateUser, User, userSubscribedTo } from '../types/user.js';
import { ChangePost, CreatePost, POST } from '../types/post.js';
import { createUserType } from '../types/user-type.js';
import { createPostType } from '../types/post-type.js';
import { UUIDType } from '../types/uuid.js';
import {
  ProfileType,
  createProfileType,
  changeProfileType,
} from '../types/profile-type.js';
import { ChangeProfile, CreateProfile, Profile } from '../types/profile.js';

export const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser: {
      type: UserType,
      args: { dto: { type: createUserType } },
      resolve: async (_, _args: CreateUser, _context: Environment) => {
        const newUser = await _context.db.user.create({ data: _args.dto });
        return newUser;
      },
    },

    changeUser: {
      type: UserType,
      args: { id: { type: UUIDType }, dto: { type: changeUserType } },
      resolve: async (_parent, _args: ChangeUser, _context: Environment) => {
        return await _context.db.user.update({
          where: { id: _args.id },
          data: _args.dto,
        });
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, _args: User, _context: Environment) => {
        try {
          await _context.db.user.delete({ where: { id: _args.id } });
        } catch (err) {
          return false;
        }
        return true;
      },
    },

    createPost: {
      type: PostType,
      args: {
        dto: { type: createPostType },
      },
      resolve: async (_parent, _args: CreatePost, _context: Environment) => {
        const db = _context.db;
        const newPost = await db.post.create({ data: _args.dto });
        return newPost;
      },
    },

    changePost: {
      type: PostType,
      args: { id: { type: UUIDType }, dto: { type: ChangePostType } },
      resolve: async (_, _args: ChangePost, _context: Environment) => {
        const db = _context.db;
        const newPost = await db.post.update({
          where: { id: _args.id },
          data: _args.dto,
        });
        return newPost;
      },
    },

    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, _args: POST, _context: Environment) => {
        try {
          const db = _context.db;
          await db.post.delete({ where: { id: _args.id } });
        } catch (err) {
          console.error(err);
          return false;
        }
        return true;
      },
    },

    createProfile: {
      type: ProfileType,
      args: { dto: { type: createProfileType } },
      resolve: async (_, _args: CreateProfile, _context: Environment) => {
        const db = _context.db;
        const newProfile = await db.profile.create({ data: _args.dto });
        return newProfile;
      },
    },

    changeProfile: {
      type: ProfileType,
      args: { id: { type: UUIDType }, dto: { type: changeProfileType } },
      resolve: async (_, _args: ChangeProfile, _context: Environment) => {
        const db = _context.db;
        const newProfile = await db.profile.update({
          where: { id: _args.id },
          data: _args.dto,
        });
        return newProfile;
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, _args: Profile, _context: Environment) => {
        try {
          const db = _context.db;
          await db.profile.delete({ where: { id: _args.id } });
        } catch (err) {
          console.error(err);
          return false;
        }
        return true;
      },
    },

    subscribeTo: {
      type: UserType,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      resolve: async (_parent, _args: userSubscribedTo, _context: Environment) => {
        await _context.db.subscribersOnAuthors.create({
          data: { subscriberId: _args.userId, authorId: _args.authorId },
        });
        return await _context.db.user.findFirst({ where: { id: _args.userId } });
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      resolve: async (_parent, _args: userSubscribedTo, _context: Environment) => {
        try {
          await _context.db.subscribersOnAuthors.deleteMany({
            where: { subscriberId: _args.userId, authorId: _args.authorId },
          });
        } catch (err) {
          return false;
        }
        return true;
      },
    },
  }),
});
