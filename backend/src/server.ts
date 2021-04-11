// Modules Imported For Use
import express from "express";
import { ApolloServer } from "apollo-server-express";
import fs from "fs";
import path from "path";

import resolvers from "./resolvers";
import { connectToDB } from "./database/src/connection";

import cors from "cors";
import compression from "compression";

const app = express();
app.use("*", cors());
app.use(compression());

const server: ApolloServer = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, "graphql/schema.graphql"),
    "utf-8"
  ),
  resolvers,
});

server.applyMiddleware({ app, path: "/graphql" });

const port = process.env.PORT || 4000;

connectToDB();

app.listen(port, () => {
  console.log(
    `GraphQL Server Is Now Running On http://localhost:${port}/graphql`
  );
});
