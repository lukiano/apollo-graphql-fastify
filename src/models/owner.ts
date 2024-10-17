import { DataTypes, Model, Sequelize } from "sequelize"

export class Owner extends Model {
    declare id: number;
    declare driver: number;
    declare car: number;
    declare purchaseDate: Date;
    declare color: string;
}

export function initOwnerModel(sequelize: Sequelize): void {
    Owner.init(
        {
            id: {
                type: DataTypes.INTEGER,
                field: 'owner_id',
                autoIncrement: true,
                primaryKey: true,
            },
            driver: {
                type: DataTypes.INTEGER,
                field: 'driver_id',
                allowNull: false,
            },
            car: {
                type: DataTypes.STRING(255),
                field: 'car_id',
                allowNull: false,
            },
            color: {
                type: DataTypes.STRING(50),
                field: 'color',
                allowNull: false,
                unique: true,
            },
            purchaseDate: {
                type: DataTypes.DATEONLY,
                field: 'purchase_date',
                allowNull: false,
            },    
        },
        {
            tableName: 'owners',
            timestamps: false,
            sequelize,
            indexes: [
                
            ],
        },
    );
}