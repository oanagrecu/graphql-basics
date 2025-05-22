import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { Environment } from './environment.js';
import { UUIDType } from './uuid.js';
import { POST } from './post.js';
import { UserType } from './user-type.js';

export const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  description: 'Post in DB',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: UserType,
      resolve: async ({ authorId }: POST, _context: Environment) => {
        const db = _context.db;
        return await db.user.findFirst({ where: { id: authorId } });
      },
    },
  }),
});

export const createPostType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ChangePostType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});
