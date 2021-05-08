"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwt = void 0;
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJwt = (obj) => {
    return jsonwebtoken_1.default.sign(obj, config_1.default.get("jwtPrivateKey"));
};
exports.generateJwt = generateJwt;
