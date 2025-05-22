import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { GraphQLError, graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const db = fastify.prisma;
  const _context = {
    db: db,
  };
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
      const validateWithDepthLimit: readonly GraphQLError[] = validate(
        schema,
        parse(req.body.query),
        [depthLimit(5)],
      );
      if (validateWithDepthLimit.length > 0) {
        return {
          errors: validateWithDepthLimit,
        };
      }
      const data = await graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: _context,
      });
      return data;
    },
  });
};

export default plugin;
