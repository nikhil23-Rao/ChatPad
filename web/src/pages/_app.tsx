import { AppProps } from 'next/app';
import '@/styles/global.css';
import '@fontsource/inter';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';

import { setup } from 'twind';
import twindConfig from '../twind.config';

if (typeof window !== `undefined`) {
  setup(twindConfig);
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
