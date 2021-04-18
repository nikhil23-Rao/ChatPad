import { UserType } from "./types/UserType";
import { User } from "../src/database/models/User";
import bcrypt from "bcrypt";
import { ApolloError } from "apollo-server-express";
import { generateJwt } from "./auth/generateJwt";

const resolvers = {
  Query: {
    GetUserId: async (_: void, args: UserType) => {
      const user: UserType | null = await User.findOne({
        where: { email: args.email },
      });
      return user?.id;
    },
  },
  Mutation: {
    Register: async (_: void, args: UserType) => {
      await User.sync({ force: true });

      const salt = await bcrypt.genSalt(10);
      console.log(process.env.OAUTH_PASSWORD);
      let password;
      await bcrypt.hash(process.env.OAUTH_PASSWORD!, salt, (err, hash) => {
        console.log("ERROR", err);
        password = hash;
      });

      if (!args.oauth) {
        password = await bcrypt.hash(args.password, salt);
      }

      if (await User.findOne({ where: { email: args.email } })) {
        throw new ApolloError("Account with the given email already exists.");
      }

      const user: UserType = User.build({
        username: args.username,
        email: args.email,
        password,
        profile_picture: args.profile_picture,
        oauth: args.oauth,
        id: args.id,
      });

      await user.save();

      const token = generateJwt({
        username: user.username,
        email: user.email,
        id: user.id,
        oauth: user.oauth,
        profile_picture: user.profile_picture,
      });

      return token;
    },

    Login: async (_: void, args: UserType) => {
      let user: UserType | null = await User.findOne({
        where: { email: args.email },
      });
      if (!user) return new ApolloError("Invalid email or password.");

      if (!args.oauth) {
        const validPassword = await bcrypt.compare(
          args.password,
          user.password!
        );
        if (!validPassword)
          return new ApolloError("Invalid email or password.");
      }

      const token = generateJwt({
        email: user.email,
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture,
      });

      return token;
    },
  },
};

export default resolvers;
