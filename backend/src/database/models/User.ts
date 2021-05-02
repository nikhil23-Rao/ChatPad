import { DataTypes } from "sequelize";
import { sequelize } from "../src/connection";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  profile_picture: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue:
      "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png?w=640",
  },
  oauth: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  dark_theme: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
});
