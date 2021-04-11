import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DB_URL!, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully Connected To Postgresql DB");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
