import { Model } from "sequelize";

export interface UserType extends Model {
  username?: string;
  password?: string;
  email?: string;
  profile_picture?: string;
  id?: string;
  oauth?: boolean;
  dark_theme?: boolean;
}
