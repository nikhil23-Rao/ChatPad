import { User } from "../src/database/models/User";
import { UserType } from "./types/UserType";
import bcrypt from "bcrypt";
import { ApolloError } from "apollo-server-express";
import { generateJwt } from "./auth/generateJwt";
import { GroupType } from "./types/GroupType";
import { Group } from "./database/models/Group";
import { pubsub } from "./server";
import { Model } from "sequelize/types";
import { MessageType } from "./types/MessageType";

const NEW_MESSAGE = "NEW_MESSAGE";

const resolvers = {
  Subscription: {
    GetAllMessages: {
      subscribe: () => pubsub.asyncIterator(NEW_MESSAGE),
    },
  },
  Query: {
    GetUserId: async (_: void, args: UserType) => {
      const user: UserType | null = await User.findOne({
        where: { email: args.email },
      });
      return user?.id;
    },
    GetAllUsers: async () => {
      const users: UserType | Model<any, any>[] = await User.findAll();
      return users;
    },
    GetGroups: async (_: void, args: GroupType) => {
      const allGroups:
        | GroupType
        | Model<any, any>[]
        | any = await Group.findAll();
      let groups = [];
      for (const group in allGroups) {
        if (
          allGroups[group].members.some(
            (m: GroupType) => m.id === args.authorid
          )
        ) {
          groups.push(allGroups[group]);
        }
      }
      return groups;
    },
    GetInitialMessages: async (_: void, args: { groupid: string }) => {
      const group: GroupType | null = await Group.findOne({
        where: { id: args.groupid },
      });
      if (!group) return "Invalid ID";
      const messages = [];
      console.log("MESSAGES", group.messages);
      for (const message in group.messages) {
        console.log("HYDEHHDYEW*", message);
        messages.push(group.messages[message as any] as any);
      }
      return messages;
    },
  },
  Mutation: {
    Register: async (_: void, args: UserType) => {
      // await User.sync({ force: true });

      const salt = await bcrypt.genSalt(10);
      console.log(process.env.OAUTH_PASSWORD);
      let password;
      await bcrypt.hash(process.env.OAUTH_PASSWORD!, salt, (err, hash) => {
        console.log("", err);
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
    CreateGroup: async (_: void, args: GroupType) => {
      // await Group.sync({ force: true });
      const group = Group.build({
        messages: [],
        id: args.id,
        members: args.members,
        name: args.name,
      });
      await group.save();

      return true;
    },
    SendMessage: async (_: void, args: GroupType) => {
      const group: GroupType | null = await Group.findOne({
        where: { id: args.groupid },
      });
      if (!group) return "Invalid ID";

      const newMessage = {
        body: args.body,
        authorid: args.authorid,
        messageid: args.messageid,
        groupid: args.groupid,
      };
      const payload = {
        GetAllMessages: [
          ...(group.messages as any),
          {
            body: args.body,
            messageid: args.messageid,
            authorid: args.authorid,
            groupid: args.groupid,
          },
        ],
      };
      pubsub.publish(NEW_MESSAGE, payload);
      const messages = [...(group.messages as any)];
      messages.push(newMessage);
      group.messages = messages as any;
      await group.save();
      return true;
    },
    StartSubscription: async (_: void, args: GroupType) => {
      const group: GroupType | null = await Group.findOne({
        where: { id: args.groupid },
      });
      if (!group) return "INVALID ID";
      group.messages?.pop();
      await group.save();
      return true;
    },
  },
};

export default resolvers;
