"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../src/connection");
exports.User = connection_1.sequelize.define("User", {
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
    },
    profile_picture: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png?w=640",
    },
    oauth: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    dark_theme: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    online: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    id: {
        primaryKey: true,
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
