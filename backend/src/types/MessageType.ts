import { Model } from "sequelize";

export interface MessageType extends Model {
  id?: string;
  authorid?: string;
  body?: string;
}
