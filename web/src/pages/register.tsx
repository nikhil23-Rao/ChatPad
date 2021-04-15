import { Stack, InputGroup, InputLeftElement, Input, Button, Spinner } from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import React, { useState } from 'react';
import client from '../../apollo-client';
import registerStyles from '../styles/register.module.css';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { REGISTER } from '../apollo/Mutations';
import { signIn, useSession, providers } from 'next-auth/client';
import { generateId } from '@/utils/GenerateId';
import { useRouter } from 'next/dist/client/router';
interface RegisterProps {
  myproviders: { myproviders: { name: string; id: string | undefined } };
}

const registerValidationSchema = Yup.object({}).shape({
  email: Yup.string().email().required().label('Email'),
  username: Yup.string().required().max(20).label('Username'),
  password: Yup.string().required().min(5).max(18).label('Password'),
});

export const getServerSideProps = async () => {
  const myproviders = await providers();
  return {
    props: { myproviders },
  };
};

const Register: React.FC<RegisterProps> = ({ myproviders }: RegisterProps) => {
  const router = useRouter();
  const [apolloError, setApolloError] = useState(false);
  return (
    <>
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-light py-3">
          <div className="container">
            <a href="#" className="navbar-brand">
              <img src="/images/chatpadlogo.png" alt="logo" width="90" />
            </a>
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="row py-5 mt-4 align-items-center">
          <div className="col-md-5 pr-lg-5 mb-5 mb-md-0">
            <img
              src="https://res.cloudinary.com/mhmd/image/upload/v1569543678/form_d9sh6m.svg"
              alt=""
              className="img-fluid mb-3 d-none d-md-block"
            />
            <h1>Create an Account</h1>
            <p className="font-italic text-muted mb-0">Don't Want To Use The Website? Or, Want To Chat On The Go?</p>
            <p className="font-italic text-muted" style={{ color: 'blue', textDecoration: 'underline' }}>
              <a href="https://google.com" style={{ color: 'blue' }}>
                Download The Mobile App Here.
              </a>
            </p>
          </div>

          <div className="col-md-7 col-lg-6 ml-auto">
            <Formik
              initialValues={{ username: '', email: '', password: '' }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true);
                  console.log(values);
                  await client.mutate({
                    mutation: REGISTER,
                    variables: {
                      username: values.username,
                      email: values.email,
                      password: values.password,
                      profile_picture:
                        'https://www.watsonmartin.com/wp-content/uploads/2016/03/default-profile-picture.jpg',
                      id: generateId(24),
                    },
                  });
                  router.push('/feed');
                } catch (err) {
                  return setApolloError(true);
                }
              }}
              validationSchema={registerValidationSchema}
            >
              {({ handleSubmit, handleChange, touched, errors, isSubmitting }) => {
                const isInvalidEmail = errors.email && touched.email ? true : false;
                const isInvalidPassword = errors.password && touched.password ? true : false;
                const isInvalidUsername = errors.username && touched.username ? true : false;

                return (
                  <div className="row">
                    <div>
                      <Stack spacing={4}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" children={<EmailIcon />} />
                          <Input
                            isInvalid={isInvalidEmail || apolloError}
                            errorBorderColor="crimson"
                            name="email"
                            onChange={handleChange}
                            placeholder="Email Address..."
                          />
                        </InputGroup>
                        <p className={registerStyles.errTxt}>
                          {isInvalidEmail && errors.email}{' '}
                          {apolloError && 'The Account With The Given Email Already Exists.'}
                        </p>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" fontSize="1.2em" children={<AccountCircleIcon />} />
                          <Input
                            isInvalid={isInvalidUsername}
                            errorBorderColor="crimson"
                            name="username"
                            onChange={handleChange}
                            placeholder="Username..."
                          />
                        </InputGroup>
                        <p className={registerStyles.errTxt}>{isInvalidUsername && errors.username}</p>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" fontSize="1.2em" children={<LockIcon />} />
                          <Input
                            isInvalid={isInvalidPassword}
                            style={{  paddingLeft: 45 }}
                            type="password"
                            errorBorderColor="crimson"
                            name="password"
                            onChange={handleChange}
                            placeholder="Password..."
                          />
                        </InputGroup>
                        <p className={registerStyles.errTxt}>{isInvalidPassword && errors.password}</p>
                      </Stack>
                    </div>

                    <div className="form-group col-lg-12 mx-auto mb-0 mt-4 text-center">
                      <Button
                        className="btn btn-primary btn-block py-2"
                        style={{ width: '100%', backgroundColor: '#0C6DFD' }}
                        isLoading={isSubmitting}
                        onClick={() => handleSubmit()}
                      >
                        <span className="font-weight-bold" style={{ fontWeight: 'bold' }}>
                          Create your account
                        </span>
                      </Button>
                    </div>

                    <div className="form-group col-lg-12 mx-auto d-flex align-items-center my-4">
                      <div className="border-bottom w-100 ml-5"></div>
                      <span className="px-2 small text-muted font-weight-bold text-muted">OR</span>
                      <div className="border-bottom w-100 mr-5"></div>
                    </div>

                    {myproviders &&
                      Object.values(myproviders).map((provider) => {
                        if (provider.name.includes('Google')) {
                          return (
                            <div className="form-group col-lg-12 mx-auto" key={provider.id}>
                              <a
                                onClick={() => signIn(provider.id, { callbackUrl: 'http://localhost:3000/feed' })}
                                className={`btn btn-primary btn-block py-2 mb-3 ${registerStyles.btnGoogle}`}
                              >
                                <i className="fa fa-google fa-2x mr-1"></i>
                                <span
                                  className="font-weight-bold"
                                  style={{ bottom: 5, fontWeight: 'bold', marginLeft: 10, position: 'relative' }}
                                >
                                  Register with Google
                                </span>
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="form-group col-lg-12 mx-auto" key={provider.id}>
                              <a
                                onClick={() => signIn(provider.id, { callbackUrl: 'http://localhost:3000/feed' })}
                                className={`btn btn-primary btn-block py-2 mb-3 ${registerStyles.btnGithub}`}
                              >
                                <i className="fa fa-github fa-2x mr-1"></i>
                                <span
                                  className="font-weight-bold"
                                  style={{ bottom: 5, fontWeight: 'bold', marginLeft: 10, position: 'relative' }}
                                >
                                  Register with Github
                                </span>
                              </a>
                            </div>
                          );
                        }
                      })}

                    <div className="text-center w-100">
                      <p className="text-muted font-weight-bold">
                        Already Registered?{' '}
                        <a href="" className="text-primary ml-2">
                          Login
                        </a>
                      </p>
                    </div>
                  </div>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
