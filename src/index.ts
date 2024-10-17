import Fastify, { FastifyLoggerOptions } from "fastify";
import { LoggerOptions as PinoLoggerOptions } from "pino";

import { initGraphQLServer } from "./graphql";
import { initSequelize } from "./sequelize";

type Environment = "development" | "test" | "production";
const environment: Environment = process.env["NODE_ENV"] as Environment || "development";

type LoggerOptions = {
  [env in Environment]: FastifyLoggerOptions & PinoLoggerOptions | boolean;
};

const envToLogger: LoggerOptions = {
  development: {
    level: "debug",
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}

const fastify = Fastify(
  {
    forceCloseConnections: true,
    logger: envToLogger[environment],
  },
);

await initSequelize(fastify);
await initGraphQLServer(fastify);

await fastify.listen({ port: 8080 });