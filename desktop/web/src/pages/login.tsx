import { Stack, InputGroup, InputLeftElement, Input, Button } from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import React, { useState } from 'react';
import client from '../../apollo-client';
import registerStyles from '../styles/register.module.css';
import { Formik } from 'formik';
import { LOGIN } from '../apollo/Mutations';
import { signIn, providers } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { registerValidationSchema } from '@/components/validation/RegisterValidationSchema';
import { loginValidationSchema } from '@/components/validation/LoginValidationSchema';

interface LoginProps {
  myproviders: { myproviders: { name: string; id: string | undefined } };
}

export const getServerSideProps = async () => {
  const myproviders = await providers();
  return {
    props: { myproviders },
  };
};

const Login: React.FC<LoginProps> = ({ myproviders }: LoginProps) => {
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
            <img src="https://i.imgur.com/uNGdWHi.png" alt="" className="img-fluid mb-3 d-none d-md-block" />
            <h1>Login To Your Account</h1>
            <p className="font-italic text-muted mb-0">
              Welcome Back To ChatPad. To Continue Chatting, Login To Your Account Here
            </p>
          </div>

          <div className="col-md-7 col-lg-6 ml-auto">
            <Formik
              initialValues={{ email: '', password: '' }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true);
                  const result = await client.mutate({
                    mutation: LOGIN,
                    variables: {
                      email: values.email,
                      password: values.password,
                    },
                  });
                  localStorage.setItem('token', result.data.Login!);
                  router.push('/feed');
                } catch (err) {
                  return setApolloError(true);
                }
              }}
              validationSchema={loginValidationSchema}
            >
              {({ handleSubmit, handleChange, touched, errors, isSubmitting }) => {
                const isInvalidEmail = errors.email && touched.email ? true : false;
                const isInvalidPassword = errors.password && touched.password ? true : false;
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
                          {isInvalidEmail && errors.email} {apolloError && 'Invalid Email or Password.'}
                        </p>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" fontSize="1.2em" children={<LockIcon />} />
                          <Input
                            isInvalid={isInvalidPassword}
                            style={{ paddingLeft: 45 }}
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
                          Sign In
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
                                  Sign in with Google
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
                                  Sign in with Github
                                </span>
                              </a>
                            </div>
                          );
                        }
                      })}

                    <div className="text-center w-100">
                      <p className="text-muted font-weight-bold">
                        Don't Have An Account?{' '}
                        <Link href="/register">
                          <a className="text-primary ml-2">Register Here</a>
                        </Link>
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

export default Login;
