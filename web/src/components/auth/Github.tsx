import { Button } from '@chakra-ui/react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { signIn, signOut, useSession, providers } from 'next-auth/client';
import React from 'react';

export default function GitHub({ myproviders }: any) {
  if (!myproviders) {
    console.log(myproviders);
  }
  return (
    <>
      {myproviders &&
        Object.values(myproviders).map((provider: any) => (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id)}>Sign in with {provider.name}</button>
          </div>
        ))}
    </>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context: any) {
  const myproviders = await providers();
  return {
    props: { myproviders },
  };
}
