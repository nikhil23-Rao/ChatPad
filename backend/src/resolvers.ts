import { UserType } from "./types/UserType";
import { User } from "../src/database/models/User";
import bcrypt from "bcrypt";
import { ApolloError } from "apollo-server-express";
import { generateJwt } from "./auth/generateJwt";

const resolvers = {
  Query: {
    hello: () => "Hello World",
  },
  Mutation: {
    Register: async (_: void, args: UserType) => {
      await User.sync({ force: true });

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(args.password, salt);

      if (await User.findOne({ where: { email: args.email } })) {
        throw new ApolloError("Account with the given email already exists.");
      }

      const user: UserType = User.build({
        username: args.username,
        email: args.email,
        password,
        profile_picture: args.profile_picture,
        id: args.id,
      });

      await user.save();

      const token = generateJwt({
        username: user.username,
        email: user.email,
        id: user.id,
        profile_picture: user.profile_picture,
      });

      return token;
    },
  },
};

export default resolvers;
