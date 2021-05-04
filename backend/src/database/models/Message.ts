import { DataTypes } from "sequelize";
import { sequelize } from "../src/connection";

export const Message = sequelize.define("Message", {
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  author: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  groupid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messageid: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
});
