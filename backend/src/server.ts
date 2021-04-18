// Modules Imported For Use
import express from "express";
import { ApolloServer, PubSub } from "apollo-server-express";
import fs from "fs";
import path from "path";
import config from "config";

import resolvers from "./resolvers";
import { connectToDB } from "./database/src/connection";

import cors from "cors";
import compression from "compression";
import { createServer } from "http";

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtKey Not Defined!");
  process.exit(1);
}

const app = express();
app.use("*", cors());
app.use(compression());

export const pubsub = new PubSub();

const server: ApolloServer = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, "graphql/schema.graphql"),
    "utf-8"
  ),
  resolvers,
  subscriptions: {
    path: "/subscriptions",
    onConnect: async (connectionParams, webSocket) => {
      console.log("Connected To Subscriptions URL");
      console.log(connectionParams);
      console.log(webSocket);
    },
  },
});

const httpServer = createServer(app);

server.applyMiddleware({ app, path: "/graphql" });
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 4000;

connectToDB();

httpServer.listen(port, () => {
  console.log(
    `GraphQL Server Is Now Running On http://localhost:${port}/graphql`
  );
  console.log(
    `GraphQL Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});
