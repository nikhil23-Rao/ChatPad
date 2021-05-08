"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubsub = void 0;
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
const resolvers_1 = __importDefault(require("./resolvers"));
const connection_1 = require("./database/src/connection");
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
if (!config_1.default.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: jwtKey Not Defined!");
    process.exit(1);
}
const app = express_1.default();
app.use("*", cors_1.default());
app.use(compression_1.default());
exports.pubsub = new apollo_server_express_1.PubSub();
const server = new apollo_server_express_1.ApolloServer({
    typeDefs: fs_1.default.readFileSync(path_1.default.join(__dirname, "graphql/schema.graphql"), "utf-8"),
    resolvers: resolvers_1.default,
    subscriptions: {
        path: "/subscriptions",
        onConnect: (connectionParams, webSocket) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Connected To Subscriptions URL");
        }),
    },
});
const httpServer = http_1.createServer(app);
server.applyMiddleware({ app, path: "/graphql" });
server.installSubscriptionHandlers(httpServer);
const port = process.env.PORT || 4000;
connection_1.connectToDB();
httpServer.listen(port, () => {
    console.log(`GraphQL Server Is Now Running On http://localhost:${port}/graphql`);
    console.log(`GraphQL Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
