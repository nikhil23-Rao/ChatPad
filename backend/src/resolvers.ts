import { User } from "../src/database/models/User";

const resolvers = {
  Query: {
    hello: () => "Hello World",
  },
};

export default resolvers;
