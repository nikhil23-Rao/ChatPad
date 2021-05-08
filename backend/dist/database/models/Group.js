"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../src/connection");
exports.Group = connection_1.sequelize.define("Group", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    members: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSON),
        allowNull: false,
    },
    id: {
        primaryKey: true,
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
