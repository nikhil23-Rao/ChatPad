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
      "https://www.watsonmartin.com/wp-content/uploads/2016/03/default-profile-picture.jpg",
  },
  oauth: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
});
