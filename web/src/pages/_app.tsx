import { AppProps } from 'next/app';
import '@/styles/global.css';
import '@fontsource/inter';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import { ChakraProvider } from '@chakra-ui/react';

import { setup } from 'twind';
import twindConfig from '../twind.config';
import { Provider } from 'next-auth/client';

if (typeof window !== `undefined`) {
  setup(twindConfig);
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Provider session={pageProps.session}>
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
}
