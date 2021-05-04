import { Model } from "sequelize";
import { MessageType } from "./MessageType";

export interface GroupType extends Model {
  messages?: Array<MessageType>;
  body?: string;
  messageid?: string;
  authorid?: string;
  members?: Array<any>;
  id?: string;
  groupid?: string;
  pubsub?: any;
  name?: string;
  author?: any;
  image?: boolean;
}
