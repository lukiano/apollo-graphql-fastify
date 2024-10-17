import { DataTypes, Model, Sequelize } from "sequelize";

export class Car extends Model {
    declare id: number;
    declare brand: string;
    declare model: string;

    static fetchCarsOfBrand(brand: string): Promise<Array<Car>> {
        return Car.findAll(
            {
                where: {
                    brand,
                },
            },
        );
    }
}

export function initCarModel(sequelize: Sequelize): void {
    Car.init(
        {
          id: {
            type: DataTypes.INTEGER,
            field: 'id',
            autoIncrement: true,
            primaryKey: true,
          },
          brand: {
            type: DataTypes.STRING(255),
            field: 'brand',
            allowNull: false,
          },
          model: {
            type: DataTypes.STRING(255),
            field: 'model',
            allowNull: false,
          },
        },
        {
            tableName: 'cars',
            timestamps: false,
            sequelize,
            indexes: [
                
            ],
        },
      );
}