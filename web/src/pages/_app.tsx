import { AppProps } from 'next/app';

import '@/styles/global.css';
import '@fontsource/inter';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import 'emoji-mart/css/emoji-mart.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-awesome-lightbox/build/style.css';

import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';

import { setup } from 'twind';
import twindConfig from '../twind.config';
import { Provider } from 'next-auth/client';
import { ApolloProvider, useMutation } from '@apollo/client';
import client from '../../apollo-client';

if (typeof window !== `undefined`) {
  setup(twindConfig);
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastContainer />
      <ChakraProvider>
        <ApolloProvider client={client}>
          <Provider session={pageProps.session}>
            <Component {...pageProps} />
          </Provider>
        </ApolloProvider>
      </ChakraProvider>
    </>
  );
}
