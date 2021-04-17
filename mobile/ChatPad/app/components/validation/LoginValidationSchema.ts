import * as Yup from "yup";

export const loginValidationSchema = Yup.object({}).shape({
  email: Yup.string().email().required().label("Email"),
  password: Yup.string().required().min(5).max(18).label("Password"),
});
