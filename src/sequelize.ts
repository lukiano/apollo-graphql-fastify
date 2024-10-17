import { FastifyInstance } from "fastify";
import { Sequelize } from "sequelize";

import { Car, initCarModel } from "./models/car";
import { Driver, initDriverModel } from "./models/driver";
import { Owner, initOwnerModel } from "./models/owner";

function buildSequelize(logging: (message: string) => void): Sequelize {
    const dbUrl = "postgres://luciano@localhost:5432/luciano";
    const sequelize = new Sequelize(dbUrl, { native: true, logging });
    initCarModel(sequelize);
    initDriverModel(sequelize);
    initOwnerModel(sequelize);

    // Defining the many to many relationships but they are not used by the resolvers.
    Car.belongsToMany(Driver, {
        through: Owner,
        timestamps: false,
        otherKey: "driver",
        sourceKey: "id",
        targetKey: "id",
    });
    Driver.belongsToMany(Car, {
        through: Owner,
        timestamps: false,
        otherKey: "car",
        sourceKey: "id",
        targetKey: "id",
    });

    return sequelize;
}

export async function initSequelize(fastify: FastifyInstance): Promise<void> {
    const sequelize = buildSequelize((args) => fastify.log.debug(args));
    await sequelize.authenticate();
    fastify.addHook("onClose", () => sequelize.close());
}