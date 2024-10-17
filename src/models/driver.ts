import { DataTypes, Model, Sequelize } from "sequelize";

import { Car } from "./car";

export class Driver extends Model {
    declare id: number;
    declare name: string;
    declare surname: string;
    declare licence: string;
    declare birthDate: Date;
    declare getCars: () => Promise<Array<Car>>;
    getFullName() {
        return `${this.name} ${this.surname}`;
    }
}

export function initDriverModel(sequelize: Sequelize): void {
    Driver.init(
        {
          id: {
            type: DataTypes.INTEGER,
            field: 'id',
            autoIncrement: true,
            primaryKey: true,
          },
          name: {
            type: DataTypes.STRING(50),
            field: 'name',
            allowNull: false,
          },
          surname: {
            type: DataTypes.STRING(50),
            field: 'surname',
            allowNull: false,
          },
          licence: {
            type: DataTypes.STRING(20),
            field: 'licence',
            allowNull: false,
            unique: true,
          },
          birthDate: {
            type: DataTypes.DATEONLY,
            field: 'birth_date',
            allowNull: false,
          },
        },
        {
            tableName: 'drivers',
            timestamps: false,
            sequelize,
            indexes: [

            ],
        },
      );
}