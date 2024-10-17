import { readFile } from "node:fs/promises";

import { ApolloServer, BaseContext } from "@apollo/server";

import { ApolloFastifyContextFunction, fastifyApolloDrainPlugin, fastifyApolloHandler } from "@as-integrations/fastify";

import { FastifyInstance } from "fastify";
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { GraphQLResolveInfo } from "graphql";
import { BaseLogger } from "pino";

import { Car } from "./models/car";
import { Driver } from "./models/driver";
import { Owner } from "./models/owner";

interface Context extends BaseContext {
    logger: BaseLogger;
}

type OwnedCar = {
    brand: string;
    model: string;
    purchaseDate: Date;
    color: string;
};

type FindOptions<T> = {
    attributes?: Array<keyof T>;
    where?: Partial<{ [K in keyof T]: string | number | boolean }>;
}
  
function buildGraphQLServer(typeDefs: string): ApolloServer<Context> {
    return new ApolloServer({
        typeDefs,
        resolvers: {
            Query: {
                async cars(_parent: unknown, args: { brand?: string }, contextValue: Context, info: GraphQLResolveInfo): Promise<Array<Car>> {
                    contextValue.logger.debug("Fetching cars");
                    const parsedInfo = parseResolveInfo(info);
                    const findArgs: FindOptions<Car> = {};
                    if (parsedInfo) {
                        findArgs.attributes = Object.keys(parsedInfo.fieldsByTypeName["Car"]) as Array<keyof Car>;
                    }
                    if (args.brand) {
                        findArgs.where = {
                            brand: args.brand
                        };
                    }
                    return Car.findAll(findArgs);
                },
                async drivers(_parent: unknown, args: { brand?: string }, contextValue: Context, info: GraphQLResolveInfo): Promise<Array<Driver>> {
                    contextValue.logger.debug("Fetching drivers");
                    const parsedInfo = parseResolveInfo(info);
                    const findArgs: FindOptions<Driver> = {};
                    if (parsedInfo) {
                        findArgs.attributes = ['id', ...Object.keys(parsedInfo.fieldsByTypeName["Driver"]).filter((value) => value != "cars") as Array<keyof Driver>];
                    }
                    // Cars won't be requested from each driver as it will be fetched from the function below.
                    return Driver.findAll(findArgs);
                },
            },
            Driver: {
                async cars(parent: Driver, _args: unknown, contextValue: Context, info: GraphQLResolveInfo): Promise<Array<OwnedCar>> {
                    // Called for each Driver (1+N problem)
                    contextValue.logger.debug("Fetching nested cars");
                    const parsedInfo = parseResolveInfo(info);
                    const attributes = parsedInfo ? Object.keys(parsedInfo.fieldsByTypeName["OwnedCar"]) : []; 
                    // First we retrieve the car id from the Owner table. Also the color and purchase date if they were requested.
                    const findArgsOwnerQuery: FindOptions<Owner> = {};
                    findArgsOwnerQuery.attributes = ['car'];
                    if (attributes.includes('color')) {
                        findArgsOwnerQuery.attributes.push('color');
                    }
                    if (attributes.includes('purchaseDate')) {
                        findArgsOwnerQuery.attributes.push('purchaseDate');
                    }
                    findArgsOwnerQuery.where = {
                        driver: parent.id,
                    };
                    const carsFromDriver = await Owner.findAll(findArgsOwnerQuery);
                    const findArgsCarQuery: FindOptions<Car> = {};
                    findArgsCarQuery.attributes = [];
                    if (attributes.includes('brand')) {
                        findArgsCarQuery.attributes.push('brand');
                    }
                    if (attributes.includes('model')) {
                        findArgsCarQuery.attributes.push('model');
                    }
                    if (findArgsCarQuery.attributes.length === 0) {
                        // No need to fetch data from Car.
                        return carsFromDriver.map((owner) => {
                            return {
                                brand: '',
                                model: '',
                                purchaseDate: owner.purchaseDate,
                                color: owner.color,  
                            };
                        });
                    }
                    const buildOwnedCar = async (owner: Owner) => {
                        // For each returned car we fetch the brand and model if they were requested;
                        // TODO: We could have done a JOIN of the Car table with the Owner table.
                        const car = await Car.findByPk(owner.car, findArgsCarQuery);
                        if (!car) {
                            throw new Error('Car not found');
                        }
                        return {
                            brand: car.brand,
                            model: car.model,
                            purchaseDate: owner.purchaseDate,
                            color: owner.color,
                        };
                    };
                    return Promise.all(carsFromDriver.map(buildOwnedCar));
                },
            },
        },
    });
}

export async function initGraphQLServer(fastify: FastifyInstance): Promise<void> {
    const typeDefs = await readFile("./schema.graphql", "utf-8");
    const apollo = buildGraphQLServer(typeDefs);
    apollo.addPlugin(fastifyApolloDrainPlugin(fastify));
    await apollo.start();
    fastify.addHook("onClose", () => apollo.stop());
    const myContextFunction: ApolloFastifyContextFunction<Context> = async (request, _reply) => ({
        logger: request.log,
    });
    fastify.route({
        method: ["GET", "POST", "OPTIONS"],
        url: "/graphql",
        handler: fastifyApolloHandler(apollo, { context: myContextFunction }),
    });      
}