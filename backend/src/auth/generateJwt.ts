import config from "config";
import jwt from "jsonwebtoken";

export const generateJwt = (obj: Object) => {
  return jwt.sign(obj, config.get("jwtPrivateKey"));
};
