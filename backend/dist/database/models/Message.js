"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../src/connection");
exports.Message = connection_1.sequelize.define("Message", {
    body: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    author: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    groupid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    messageid: {
        primaryKey: true,
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    time: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
    },
});
