import * as Yup from 'yup';

export const registerValidationSchema = Yup.object({}).shape({
    email: Yup.string().email().required().label('Email'),
    username: Yup.string().required().max(20).label('Username'),
    password: Yup.string().required().min(5).max(18).label('Password'),
  });