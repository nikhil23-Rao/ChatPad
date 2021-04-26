import { DataTypes } from "sequelize";
import { sequelize } from "../src/connection";

export const Group = sequelize.define("Group", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messages: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    allowNull: false,
  },
  members: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    allowNull: false,
  },
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
});
