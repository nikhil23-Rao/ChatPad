import React, { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../styles/feed.module.css';
import client from '@/../apollo-client';
import { GET_CHAT_PATHS, GET_GROUPS, GET_INITIAL_MESSAGES, GET_USER_ID } from '../apollo/Queries';
import { Search } from '../components/Search';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { IconButton } from '@material-ui/core';
import { SEND_MESSAGE, START_SUBSCRIPTION, UPDATE_TIME } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import Head from 'next/head';
import { GET_ALL_MESSAGES } from '@/apollo/Subscriptions';
import { useRouter } from 'next/dist/client/router';
import { Loader } from '@/components/loader';
import LoadingBar from 'react-top-loading-bar';

interface FeedProps {}

const Feed: React.FC<FeedProps> = ({}) => {
  const [groupSelected, setGroupSelected] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [messageVal, setMessageVal] = useState('');
  const [session] = useSession();
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    dark_theme: string;
    iat?: string | null | undefined;
  } | null>(null);
  const router = useRouter();

  const GetUser = async () => {
    const paths = await client.query({ query: GET_CHAT_PATHS });
    console.log(paths);
    const token = localStorage.getItem('token');
    if (session && !token) {
      const result = await client.query({ query: GET_USER_ID, variables: { email: session.user.email } });
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
        dark_theme: string;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId[0],
        dark_theme: result.data.GetUserId[1],
        profile_picture: session.user.image!,
      };
      setDarkMode(currentUser.dark_theme === 'true' ? true : false);
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
        dark_theme: string;
      } = jwtDecode(token!);
      setDarkMode(currentUser.dark_theme === 'true' ? true : false);
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
        dark_theme: string;
      } = jwtDecode(token!);
      setUser(currentUser);
    }
  };

  const { data, loading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });
  const { data: messageData, loading: messageLoading } = useQuery(GET_INITIAL_MESSAGES, {
    variables: { groupid: groupSelected },
  });
  const { data: realtimeData } = useSubscription(GET_ALL_MESSAGES);

  useEffect(() => {
    if (user && user.dark_theme === 'true') {
      (document.body.style as any) = 'background: #1A202C';
    }
    window.scrollTo(0, document.body.scrollHeight);
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    if (data) {
      console.log(data);
    }
    if (realtimeData) {
      const res = realtimeData.GetAllMessages.filter((message) => message.groupid === groupSelected);
      console.log('RES', res);
    }
    console.log(messageData);
    console.log(groupSelected);
    console.log('REALTIME', realtimeData);
  }, [session, groupSelected, messageData, realtimeData, user?.dark_theme]);
  const [UpdateTime] = useMutation(UPDATE_TIME);
  useEffect(() => {
    const clear = setInterval(() => {
      UpdateTime();
    }, 60000);

    return () => clearInterval(clear);
  }, []);

  if (loading)
    return (
      <div style={{ backgroundColor: user?.dark_theme === 'true' ? '#1A202C' : '', height: '100vh' }}>
        <LoadingBar color="red" progress={100} loaderSpeed={2000} height={4} />
      </div>
    );

  return (
    <>
      <Head>
        <title>ChatPad</title>
        <link rel="icon" href="/images/chatpadlogo.png" />
      </Head>
      <div
        style={{
          height:
            (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
            (typeof window !== 'undefined' && window.screen.availWidth) < 1800
              ? '150vh'
              : '100vh',
          backgroundColor: darkMode ? '#1A202C' : '',
        }}
      ></div>
      <div>
        {groupSelected === '' && (
          <>
            <div
              style={{
                position: 'fixed',
                top: '46%',
                left: '50%',
              }}
            >
              <i className="fa fa-paper-plane fa-5x" style={{ color: darkMode ? '#fff' : '#000' }}></i>
            </div>
            <p style={{ top: '62%', position: 'fixed', left: '39%', color: darkMode ? '#fff' : '#000' }}>
              To start, select a group on the left hand side or create a new group.
            </p>
          </>
        )}
        <div style={{ top: -10, right: 80, position: 'absolute' }}>
          <div className="outer-menu">
            <input className="checkbox-toggle" type="checkbox" />
            <div
              className="hamburger rainbow-box"
              style={{ borderRadius: 50, backgroundColor: darkMode ? '#1A202C' : '' }}
            >
              <div>
                <i className="fa fa-plus  fa-2x" style={{ color: darkMode ? '#fff' : '#000' }}></i>
              </div>
            </div>
            <div className="menu">
              <div style={{ marginRight: '22%', backgroundColor: darkMode ? '#1A202C' : '' }}>
                <div>
                  <div className="mt-1" style={{ width: '300%' }}>
                    <Search />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={feedStyles.leftsidebar}
          style={{ backgroundColor: darkMode ? '#1A202C' : '#fff', borderRightColor: darkMode ? '#fff' : '' }}
        >
          <h1
            style={{
              fontSize: 24,
              marginRight: 35,
              marginTop: 15,
              fontFamily: 'Lato',
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Groups
          </h1>
          {data.GetGroups.map((group) => {
            if (group.members.length === 2) {
              return (
                <div
                  className={feedStyles.sidebarcontent}
                  style={{
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : darkMode ? '#fff' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => (window.location.href = `/chat/${group.id}`)}
                >
                  <div style={{ marginTop: '5%', marginLeft: '3%', paddingTop: '3%' }}>
                    <img
                      src={group.members[0].profile_picture}
                      alt=""
                      style={{ width: 30, height: 30, borderRadius: 25 }}
                    />
                  </div>

                  <div style={{ marginLeft: 3 }}>
                    <img
                      src={group.members[1].profile_picture}
                      alt=""
                      style={{ width: 30, height: 30, borderRadius: 25 }}
                    />
                  </div>

                  <p
                    style={{
                      fontWeight: groupSelected === group.id ? 'bold' : 'normal',
                      fontFamily: 'Lato',
                      color: groupSelected === group.id ? '#fff' : '#000',
                      position: 'relative',
                      bottom: 60,
                      left: 65,
                    }}
                    className={feedStyles.groupName}
                  >
                    {group.name}
                  </p>
                </div>
              );
            } else if (group.members.length === 1) {
              return (
                <div
                  className={feedStyles.sidebarcontent}
                  style={{
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : darkMode ? '#fff' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => (window.location.href = `/chat/${group.id}`)}
                >
                  <div style={{ marginTop: '5%', marginLeft: '3%', paddingTop: '3%' }}>
                    <img
                      src={group.members[0].profile_picture}
                      alt=""
                      style={{ width: 50, height: 50, borderRadius: 25 }}
                    />
                  </div>
                  <p
                    style={{
                      fontWeight: groupSelected === group.id ? 'bold' : 'normal',
                      fontFamily: 'Lato',
                      position: 'relative',
                      bottom: 50,
                      left: 75,
                      color: groupSelected === group.id ? '#fff' : '#000',
                    }}
                  >
                    {group.name}
                  </p>
                </div>
              );
            } else if (group.members.length > 2) {
              const restOfPeople = group.members.length - 2;
              return (
                <div
                  className={feedStyles.sidebarcontent}
                  style={{
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : darkMode ? '#fff' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => (window.location.href = `/chat/${group.id}`)}
                >
                  <div style={{ marginTop: '5%', marginLeft: '6%', paddingTop: '3%' }}>
                    <img
                      src={group.members[0].profile_picture}
                      alt=""
                      style={{ width: 30, height: 30, borderRadius: 25, position: 'relative', top: 3 }}
                    />
                  </div>

                  <div style={{ marginLeft: 3 }}>
                    <img
                      src={group.members[1].profile_picture}
                      alt=""
                      style={{ width: 30, height: 30, borderRadius: 25 }}
                    />
                  </div>
                  <div className={`${feedStyles.dot} text-center`}>+{restOfPeople}</div>

                  <p
                    style={{
                      fontWeight: groupSelected === group.id ? 'bold' : 'normal',
                      fontFamily: 'Lato',
                      color: groupSelected === group.id ? '#fff' : '#000',
                      position: 'relative',
                      bottom: 85,
                      left: 65,
                    }}
                  >
                    {group.name}
                  </p>
                </div>
              );
            }
          })}
        </div>
        <div
          className={feedStyles.profile}
          style={{
            backgroundColor: darkMode ? '#1A202C' : '#fff',
            borderRightColor: darkMode ? '#fff' : '',
            cursor: 'pointer',
          }}
          onClick={() => (window.location.href = '/me')}
        >
          <img
            src={user! && (user.profile_picture as string | undefined)}
            alt=""
            style={{ width: 70, height: 70, borderRadius: 35, marginTop: '3%', marginLeft: '3%' }}
          />
          <p
            style={{
              color: darkMode ? '#EDEDEE' : '#000',
              position: 'relative',
              bottom: 55,
              left: 89,
              fontFamily: 'Lato',
            }}
          >
            {user && user.username}
          </p>{' '}
          <p
            style={{
              fontFamily: 'Lato',
              color: darkMode ? '#FDFDFD' : '#6E6969',
              position: 'relative',
              bottom: 55,
              left: 89,
            }}
          >
            {user && user.email}
          </p>
        </div>
      </div>
    </>
  );
};

export default Feed;
