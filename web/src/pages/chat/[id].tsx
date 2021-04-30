import React, { useEffect, useRef, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../../styles/feed.module.css';
import client from '@/../apollo-client';
import { GET_CHAT_PATHS, GET_GROUPS, GET_INITIAL_MESSAGES, GET_USER_ID } from '../../apollo/Queries';
import { Search } from '../../components/Search';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { IconButton } from '@material-ui/core';
import { SEND_MESSAGE, START_SUBSCRIPTION } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import Head from 'next/head';
import { GET_ALL_MESSAGES } from '@/apollo/Subscriptions';
import { useRouter } from 'next/dist/client/router';
import { GetStaticProps } from 'next';

interface ChatProps {
  currId: string;
}

export const getStaticPaths = async () => {
  const res = await client.query({ query: GET_CHAT_PATHS });
  const paths = res.data.GetChatPaths.map((id) => {
    return {
      params: {
        id,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const id = context.params.id;
  return {
    props: {
      currId: id,
    },
  };
};

const Chat: React.FC<ChatProps> = ({ currId }) => {
  const [groupSelected, setGroupSelected] = useState('');
  const [messageVal, setMessageVal] = useState('');
  const [session] = useSession();
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
  } | null>(null);
  const router = useRouter();

  const GetUser = async () => {
    const token = localStorage.getItem('token');
    if (session && !token) {
      const result = await client.query({ query: GET_USER_ID, variables: { email: session.user.email } });
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId,
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
    }
  };

  const { data, loading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });
  const { data: messageData, loading: messageLoading } = useQuery(GET_INITIAL_MESSAGES, {
    variables: { groupid: groupSelected },
  });
  const [SendMessage] = useMutation(SEND_MESSAGE);
  const { data: realtimeData } = useSubscription(GET_ALL_MESSAGES);

  useEffect(() => {
    console.log('CURRENT ID', currId);
    setGroupSelected(currId);
    window.scrollTo(0, document.body.scrollHeight);
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    if (data) {
      console.log(data);
    }
    if (realtimeData) {
      console.log(realtimeData);
    }
    console.log(messageData);
    console.log(groupSelected);
    console.log('REALTIME', realtimeData);
  }, [session, groupSelected, messageData, realtimeData]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <Head>
        <title>ChatPad</title>
        <link rel="icon" href="/images/chatpadlogo.png" />
      </Head>
      <div style={{ backgroundColor: '#FCFDFC' }}>
        <div style={{ overflowY: 'scroll', height: '110vh' }}>
          {groupSelected !== '' &&
            messageData &&
            !messageLoading &&
            user &&
            messageData.GetInitialMessages.map((message) => {
              if (!realtimeData) {
                return (
                  <>
                    <div>
                      <div
                        style={{
                          position: 'relative',
                          left: message.author.id !== user.id ? 390 : 1710,
                          top: message.author.id !== user.id ? 90 : 86,
                        }}
                      >
                        {message.author.id !== user.id ? (
                          <img src={message.author.profile_picture} style={{ borderRadius: 100, width: 40 }} alt="" />
                        ) : null}
                      </div>
                      <div className={message.author.id === user.id ? feedStyles.yourmessage : feedStyles.message}>
                        <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.text}>
                          {message.body}
                        </p>
                      </div>
                    </div>
                  </>
                );
              } else {
                return;
              }
            })}
          {realtimeData &&
            realtimeData.GetAllMessages &&
            user &&
            realtimeData.GetAllMessages.map((message) => {
              return (
                <>
                  <div
                    style={{
                      position: 'relative',
                      left: message.author.id !== user.id ? 390 : 1710,
                      top: message.author.id !== user.id ? 90 : 87,
                    }}
                  >
                    {message.author.id !== user.id ? (
                      <img src={message.author.profile_picture} style={{ borderRadius: 100, width: 40 }} alt="" />
                    ) : null}
                  </div>
                  <div className={message.author.id === user.id ? feedStyles.yourmessage : feedStyles.message}>
                    <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.text}>
                      {message.body}
                    </p>
                  </div>
                </>
              );
            })}
          )
        </div>
        {groupSelected === '' && (
          <>
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img src="/images/chatpadlogo.png" style={{ borderRadius: 100 }} alt="" />
            </div>
            <p style={{ top: '62%', position: 'fixed', left: '37%' }}>
              To start chatting select a group on the left hand side, or create a new group.
            </p>
          </>
        )}
        <div style={{ top: -10, right: 80, position: 'absolute' }}>
          <div className="outer-menu">
            <input className="checkbox-toggle" type="checkbox" />
            <div className="hamburger rainbow-box" style={{ borderRadius: 50 }}>
              <div>
                <i className="fa fa-plus  fa-2x"></i>
              </div>
            </div>
            <div className="menu">
              <div style={{ marginRight: '22%' }}>
                <div>
                  <div className="mt-1" style={{ width: '300%' }}>
                    <Search />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={feedStyles.leftsidebar}>
          <h1 style={{ fontSize: 24, marginRight: 35, marginTop: 15, fontFamily: 'Lato' }}>Groups</h1>
          {data.GetGroups.length === 0 && <h1>CREATE ONE FATTY</h1>}
          {data.GetGroups.map((group) => {
            if (group.members.length === 2) {
              return (
                <div
                  className={feedStyles.sidebarcontent}
                  style={{
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : '#6588de1a',
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
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : '#6588de1a',
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
                    backgroundColor: groupSelected === group.id ? '#8ab6d6' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => (window.location.href = `/chat/${group.id}`)}
                >
                  <div style={{ marginTop: '5%', marginLeft: '5%', paddingTop: '3%' }}>
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
        <div className={feedStyles.profile} style={{ backgroundColor: '#FCFDFC', flex: 1 }}>
          <img
            src={user! && (user.profile_picture as string | undefined)}
            alt=""
            style={{ width: 70, height: 70, borderRadius: 35, marginTop: '3%', marginLeft: '3%' }}
          />
          <p
            style={{
              color: '#000',
              position: 'relative',
              bottom: 55,
              left: 89,
              fontFamily: 'Lato',
            }}
          >
            {user && user.username}
          </p>{' '}
          <p style={{ fontFamily: 'Lato', color: '#6E6969', position: 'relative', bottom: 55, left: 89 }}>
            {user && user.email}
          </p>
        </div>
        {groupSelected !== '' && user ? (
          <input
            className={feedStyles.inputfield}
            placeholder="Send a message..."
            value={messageVal}
            onKeyPress={async (e) => {
              if (e.key === 'Enter') {
                // Check If Text Is Empty Before Submitting
                if (!messageVal.trim()) {
                  return;
                }
                await SendMessage({
                  variables: {
                    groupid: groupSelected,
                    body: messageVal,
                    author: {
                      username: user.username,
                      email: user.email,
                      id: user.id,
                      profile_picture: user.profile_picture,
                    },
                    messageid: generateId(24),
                  },
                });
                setMessageVal('');
              }
            }}
            onChange={(e) => setMessageVal(e.currentTarget.value)}
          />
        ) : null}
      </div>
    </>
  );
};

export default Chat;
