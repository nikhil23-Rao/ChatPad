import { Stack, InputGroup, InputLeftElement, Input, Button } from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import client from '../../apollo-client';
import registerStyles from '../styles/register.module.css';
import { Formik } from 'formik';
import { LOGIN } from '../apollo/Mutations';
import { signIn, providers, useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { registerValidationSchema } from '@/components/validation/RegisterValidationSchema';
import { loginValidationSchema } from '@/components/validation/LoginValidationSchema';
import { tw } from 'twind';

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
  const [session] = useSession();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (session || token) {
      router.push('/feed');
    }
  }, [session]);
  const [apolloError, setApolloError] = useState(false);
  return (
    <>
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-light py-3">
          <div className="container">
            <Link href="/">
              <a className="navbar-brand">
                <img src="/images/chatpadlogo.png" alt="logo" width="90" />
              </a>
            </Link>
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="row py-5 mt-4 align-items-center">
          <div className="col-md-5 pr-lg-5 mb-5 mb-md-0">
            <img src="https://i.imgur.com/uNGdWHi.png" alt="" className="img-fluid mb-3 d-none d-md-block" />
            <h1>Login To Your Account</h1>
            <p className="font-italic text-muted mb-0">
              Welcome To ChatPad. To Start Chatting, Login To Your Account Here.
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
                    <div
                      className={tw('flex m-auto flex-col p-6 gap-5 sm:rounded-8 z-10 sm:w-400 w-full')}
                      style={{ width: '34rem', height: '24rem', borderRadius: '0px', position: 'relative', left: 10 }}
                    >
                      <div className="card-body">
                        <h5 className={tw('card-title text-3xl text-primary-100 font-bold')}>Welcome To ChatPad</h5>
                        <div className={tw('text-primary-100 flex-wrap')}>
                          By signing in you accept our&nbsp;
                          <div>
                            <a
                              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO"
                              className={tw('text-accent hover:underline')}
                              style={{ color: 'navy' }}
                            >
                              Privacy Policy
                            </a>
                            &nbsp;and&nbsp;
                            <a
                              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO"
                              className={tw('text-accent hover:underline')}
                              style={{ color: 'navy' }}
                            >
                              Terms of Service
                            </a>
                            .
                          </div>
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
                                      Continue with Google
                                    </span>
                                  </a>
                                </div>
                              );
                            } else {
                              return (
                                <div className="form-group col-lg-12 mx-auto mt-5" key={provider.id}>
                                  <a
                                    onClick={() => signIn(provider.id, { callbackUrl: 'http://localhost:3000/feed' })}
                                    className={`btn btn-primary btn-block py-2 mb-3 ${registerStyles.btnGithub}`}
                                  >
                                    <i className="fa fa-github fa-2x mr-1"></i>
                                    <span
                                      className="font-weight-bold"
                                      style={{ bottom: 5, fontWeight: 'bold', marginLeft: 10, position: 'relative' }}
                                    >
                                      Continue with Github
                                    </span>
                                  </a>
                                </div>
                              );
                            }
                          })}
                      </div>
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
