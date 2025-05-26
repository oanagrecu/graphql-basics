import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { UUID } from 'crypto';
import { schema } from './configuration/schema.js';
import {
  profilePri,
  postPri,
  userPri,
  changePostPri,
  changeProfilePri,
  changeUserPri,
  UniqueUser,
  OtherUser,
  UserFindManyIt,
} from './configuration/interfaces.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const reqBodyQuery = req.body.query;
      const reqBodyVariables = req.body.variables ?? {};
      const depthLimitNum = 5;

      const validationRules = [depthLimit(depthLimitNum)];
      const depthErrors = validate(schema, parse(reqBodyQuery), validationRules);
      if (depthErrors.length > 0) {
        return { errors: depthErrors };
      }

      const resolvers = {
        memberTypes: () => prisma.memberType.findMany(),

        memberType: async ({ id }: { id: string }) => {
          const result = await prisma.memberType.findUnique({ where: { id } });
          return result ?? null;
        },

        posts: () => prisma.post.findMany(),

        post: async ({ id }: { id: UUID }) => {
          const result = await prisma.post.findUnique({ where: { id } });
          return result ?? null;
        },

        users: async () => {
          const parseRequestedFields = (query: string) => {
            const fields: string[] = [];
            const regex = /(\w+)\s*{/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(query))) {
              const field = match[1];
              if (field) fields.push(field);
            }
            return fields;
          };

          const requestedFields = parseRequestedFields(reqBodyQuery);

          function transformArray(inputArray: UniqueUser[]) {
            return inputArray.map((item) => ({
              id: item.id,
              name: item.name,
              balance: item.balance,
              profile: item.profile,
              posts: item.posts,
              subscribedToUser:
                item.subscribedToUser?.map((sub) => ({
                  id: sub.subscriber.id,
                  name: sub.subscriber.name,
                  userSubscribedTo: sub.subscriber.userSubscribedTo.map((subTo) => ({
                    id: subTo.authorId,
                  })),
                })) ?? [],
              userSubscribedTo:
                item.userSubscribedTo?.map((sub) => ({
                  id: sub.author.id,
                  name: sub.author.name,
                  subscribedToUser: sub.author.subscribedToUser.map((subTo) => ({
                    id: subTo.subscriberId,
                  })),
                })) ?? [],
            }));
          }

          function transformArrayX(inputArray: OtherUser[]) {
            return inputArray.map((item) => ({
              id: item.id,
              name: item.name,
              balance: item.balance,
              profile: item.profile,
              posts: item.posts,
              subscribedToUser:
                item.subscribedToUser?.map((sub) => ({
                  id: sub.authorId,
                })) ?? [],
              userSubscribedTo:
                item.userSubscribedTo?.map((sub) => ({
                  id: sub.subscriberId,
                })) ?? [],
            }));
          }

          if (requestedFields.length >= 5) {
            const resultBasic = await prisma.user.findMany({
              include: {
                profile: { include: { memberType: true } },
                posts: true,
                subscribedToUser: {
                  select: { subscriber: { include: { userSubscribedTo: true } } },
                },
                userSubscribedTo: {
                  select: { author: { include: { subscribedToUser: true } } },
                },
              },
            });

            return transformArray(resultBasic as UniqueUser[]);
          } else {
            let include: UserFindManyIt = {
              profile: { include: { memberType: true } },
              posts: true,
              userSubscribedTo: true,
            };

            if (
              requestedFields.includes('userSubscribedTo') &&
              requestedFields.includes('subscribedToUser')
            ) {
              include = { ...include, subscribedToUser: true };
            }

            const resultBasic = await prisma.user.findMany({ include });
            return transformArrayX(resultBasic as OtherUser[]);
          }
        },

        user: async ({ id }: { id: UUID }) => {
          const result = await prisma.user.findUnique({
            where: { id },
            include: {
              profile: { include: { memberType: true } },
              posts: true,
            },
          });

          if (!result) return null;

          const userSubscribedToBasic = await prisma.subscribersOnAuthors.findMany({
            where: { subscriberId: id },
            include: { author: { include: { subscribedToUser: true } } },
          });

          const authorSubscribers = userSubscribedToBasic.flatMap(
            (obj) =>
              obj.author?.subscribedToUser?.map((item) => ({ id: item.subscriberId })) ??
              [],
          );

          const userSubscribedTo = userSubscribedToBasic.map((obj) => ({
            id: obj.authorId,
            name: obj.author.name,
            subscribedToUser: authorSubscribers,
          }));

          const subscribedToUserBasic = await prisma.subscribersOnAuthors.findMany({
            where: { authorId: id },
            include: { subscriber: { include: { userSubscribedTo: true } } },
          });

          const userSubscribers =
            subscribedToUserBasic.length > 0
              ? subscribedToUserBasic[0].subscriber.userSubscribedTo.map((obj) => ({
                  id: obj.authorId,
                }))
              : [];

          const subscribedToUser = subscribedToUserBasic.map((obj) => ({
            id: obj.subscriberId,
            name: obj.subscriber.name,
            userSubscribedTo: userSubscribers,
          }));

          return {
            ...result,
            userSubscribedTo,
            subscribedToUser,
          };
        },

        profiles: () => prisma.profile.findMany(),

        profile: async ({ id }: { id: UUID }) => {
          const result = await prisma.profile.findUnique({ where: { id } });
          return result ?? null;
        },

        createPost: async (postPri: postPri) => {
          return prisma.post.create({ data: postPri.dto });
        },

        createUser: async (userPri: userPri) => {
          return prisma.user.create({ data: userPri.dto });
        },

        createProfile: async (profilePri: profilePri) => {
          return prisma.profile.create({ data: profilePri.dto });
        },

        deletePost: async ({ id }: { id: UUID }) => {
          try {
            await prisma.post.delete({ where: { id } });
            return 'Post deleted successfully';
          } catch {
            return 'FS operation failed';
          }
        },

        deleteProfile: async ({ id }: { id: UUID }) => {
          try {
            await prisma.profile.delete({ where: { id } });
            return 'Profile deleted successfully';
          } catch {
            return 'FS operation failed';
          }
        },

        deleteUser: async ({ id }: { id: UUID }) => {
          try {
            await prisma.user.delete({ where: { id } });
            return 'User deleted successfully';
          } catch {
            return 'FS operation failed';
          }
        },

        changePost: async ({ id, dto }: { id: UUID; dto: changePostPri }) => {
          return prisma.post.update({ where: { id }, data: dto });
        },

        changeUser: async ({ id, dto }: { id: UUID; dto: changeUserPri }) => {
          return prisma.user.update({ where: { id }, data: dto });
        },

        changeProfile: async ({ id, dto }: { id: UUID; dto: changeProfilePri }) => {
          const profile = await resolvers.profile({ id });
          if (!profile) throw new Error(`Profile with id ${id} not found`);

          return prisma.profile.update({ where: { id }, data: dto });
        },

        subscribeTo: async ({ userId, authorId }: { userId: UUID; authorId: UUID }) => {
          try {
            await prisma.subscribersOnAuthors.create({
              data: { subscriberId: userId, authorId },
            });
            return 'Subscription successful';
          } catch {
            return 'Subscription failed';
          }
        },

        unsubscribeFrom: async ({
          userId,
          authorId,
        }: {
          userId: UUID;
          authorId: UUID;
        }) => {
          try {
            await prisma.subscribersOnAuthors.delete({
              where: { subscriberId_authorId: { subscriberId: userId, authorId } },
            });
            return 'Unsubscription successful';
          } catch {
            return 'Unsubscription failed';
          }
        },
      };

      const result = await graphql({
        schema,
        source: reqBodyQuery,
        variableValues: reqBodyVariables,
        rootValue: resolvers,
      });

      return result;
    },
  });
};

export default plugin;
