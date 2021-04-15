import client from '@/../apollo-client';
import { REGISTER } from '@/apollo/Mutations';
import { useSession } from 'next-auth/client';
import React, { useEffect, useState } from 'react';
import { GET_CURRENT_USER } from '../apollo/Queries';

interface feedProps {}

const Feed: React.FC<feedProps> = ({}) => {
  const [jwt, setJwt] = useState(null);
  const [session] = useSession();

  const GetCurrentUser = async () => {
    if (session) {
      const currentUser = await client.query({ query: GET_CURRENT_USER, variables: { email: session?.user.email } });
      setJwt(currentUser.data.GetCurrentUser);
    }
  };

  useEffect(() => {
    GetCurrentUser();
    jwt && localStorage.setItem('token', jwt!);
  });

  return (
    <>
      <div>
        <h1>{session?.user.email}</h1>
      </div>
    </>
  );
};

export default Feed;
