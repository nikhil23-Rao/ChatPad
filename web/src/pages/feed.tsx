import React, { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';

interface feedProps {}

const Feed: React.FC<feedProps> = ({}) => {
  const [session] = useSession();
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
  } | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(user);
    if (session && !token) {
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: 'd32d23d32',
        profile_picture: session.user.image!,
      };
      setUser(currentUser);
    }
    if (token) {
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
        iat: string;
        oauth: boolean;
      } = jwtDecode(token!);
      setUser(currentUser);
      window.onbeforeunload = () => {
        localStorage.removeItem('token');
      };
    }
  }, [session]);

  return (
    <>
      <div>
        <h1>
          {user && user.username} {user && user.profile_picture}
        </h1>
      </div>
    </>
  );
};

export default Feed;
