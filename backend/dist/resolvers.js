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
const User_1 = require("../src/database/models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const apollo_server_express_1 = require("apollo-server-express");
const generateJwt_1 = require("./auth/generateJwt");
const Group_1 = require("./database/models/Group");
const server_1 = require("./server");
const Message_1 = require("./database/models/Message");
const connection_1 = require("./database/src/connection");
const formatTime_1 = require("./utils/formatTime");
const NEW_MESSAGE = "NEW_MESSAGE";
const resolvers = {
    Subscription: {
        GetAllMessages: {
            subscribe: () => server_1.pubsub.asyncIterator(NEW_MESSAGE),
        },
    },
    Query: {
        GetUserId: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({
                where: { email: args.email },
            });
            return [user === null || user === void 0 ? void 0 : user.id, `${user === null || user === void 0 ? void 0 : user.dark_theme}`];
        }),
        GetAllUsers: () => __awaiter(void 0, void 0, void 0, function* () {
            const users = yield User_1.User.findAll();
            return users;
        }),
        GetGroups: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const allGroups = yield Group_1.Group.findAll();
            let groups = [];
            for (const group in allGroups) {
                if (allGroups[group].dataValues.members.some((m) => m.id === args.authorid)) {
                    groups.push(allGroups[group]);
                }
            }
            return groups;
        }),
        GetInitialMessages: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield Message_1.Message.findAll({
                where: { groupid: args.groupid },
                order: [["time", "DESC"]],
            });
            return messages;
        }),
        GetChatPaths: (_, __) => __awaiter(void 0, void 0, void 0, function* () {
            const allGroups = yield Group_1.Group.findAll();
            const ids = [];
            for (const group in allGroups) {
                ids.push(allGroups[group].id);
            }
            return ids;
        }),
        GetGroupName: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const group = yield Group_1.Group.findOne({ where: { id: args.groupid } });
            return group;
        }),
    },
    Mutation: {
        Register: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            let password;
            yield bcrypt_1.default.hash(process.env.OAUTH_PASSWORD, salt, (err, hash) => {
                password = hash;
            });
            if (!args.oauth) {
                password = yield bcrypt_1.default.hash(args.password, salt);
            }
            if (yield User_1.User.findOne({ where: { email: args.email } })) {
                throw new apollo_server_express_1.ApolloError("Account with the given email already exists.");
            }
            const user = User_1.User.build({
                username: args.username,
                email: args.email,
                password,
                profile_picture: args.profile_picture,
                oauth: args.oauth,
                id: args.id,
                online: true,
            });
            yield user.save();
            const token = generateJwt_1.generateJwt({
                username: user.username,
                email: user.email,
                id: user.id,
                oauth: user.oauth,
                profile_picture: user.profile_picture,
                dark_theme: user.dark_theme,
            });
            return token;
        }),
        Login: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            let user = yield User_1.User.findOne({
                where: { email: args.email },
            });
            if (!user)
                return new apollo_server_express_1.ApolloError("Invalid email or password.");
            if (!args.oauth) {
                const validPassword = yield bcrypt_1.default.compare(args.password, user.password);
                if (!validPassword)
                    return new apollo_server_express_1.ApolloError("Invalid email or password.");
            }
            const token = generateJwt_1.generateJwt({
                email: user.email,
                id: user.id,
                username: user.username,
                profile_picture: user.profile_picture,
                dark_theme: user.dark_theme,
            });
            return token;
        }),
        CreateGroup: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const group = Group_1.Group.build({
                id: args.id,
                members: args.members,
                name: args.name,
            });
            yield group.save();
            return true;
        }),
        SendMessage: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield Message_1.Message.findAll({
                where: { groupid: args.groupid },
                order: [["time", "DESC"]],
            });
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1;
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear();
            const newdate = month + "/" + day + "/" + year;
            const message = yield Message_1.Message.build({
                body: args.body,
                author: args.author,
                messageid: args.messageid,
                groupid: args.groupid,
                image: args.image,
                time: 0,
                date: [newdate, formatTime_1.formatAMPM(new Date())],
            });
            const previousMessages = [];
            for (const message in messages) {
                previousMessages.push(messages[message].dataValues);
            }
            yield message.save();
            const payload = {
                GetAllMessages: [
                    ...previousMessages,
                    {
                        body: args.body,
                        messageid: args.messageid,
                        author: args.author,
                        groupid: args.groupid,
                        image: args.image,
                        time: 0,
                    },
                ],
            };
            server_1.pubsub.publish(NEW_MESSAGE, payload);
            return true;
        }),
        StartSubscription: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const group = yield Group_1.Group.findOne({
                where: { id: args.groupid },
            });
            if (!group)
                return "INVALID ID";
            (_a = group.messages) === null || _a === void 0 ? void 0 : _a.pop();
            yield group.save();
            return true;
        }),
        ToggleTheme: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({
                where: { id: args.authorid },
            });
            if (!user)
                return "Invalid ID";
            if (user.dark_theme) {
                user.dark_theme = false;
                yield user.save();
                return true;
            }
            if (!user.dark_theme) {
                user.dark_theme = true;
                yield (user === null || user === void 0 ? void 0 : user.save());
                return true;
            }
        }),
        UpdateTime: (_, __) => __awaiter(void 0, void 0, void 0, function* () {
            yield connection_1.sequelize.query(`UPDATE "Messages" SET time = time + 1`);
        }),
        SwitchOnline: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({
                where: { id: args.authorid },
            });
            if (!user)
                return "INVALID ID";
            user.online = args.value;
            yield user.save();
            return true;
        }),
    },
};
exports.default = resolvers;
