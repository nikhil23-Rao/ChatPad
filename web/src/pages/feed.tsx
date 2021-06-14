import React, { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../styles/feed.module.css';
import client from '@/../apollo-client';
import { GET_CHAT_PATHS, GET_GROUPS, GET_INITIAL_MESSAGES, GET_USER_ID, SEARCH_GROUPS } from '../apollo/Queries';
import { Search } from '../components/Search';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { SET_CHAT_ON, SWITCH_ONLINE, UPDATE_TIME } from '@/apollo/Mutations';
import Head from 'next/head';
import { GET_ALL_MESSAGES } from '@/apollo/Subscriptions';
import { useRouter } from 'next/dist/client/router';
import LoadingBar from 'react-top-loading-bar';
import { Skeleton, Spinner, Input } from '@chakra-ui/react';
import { tw } from 'twind';

interface FeedProps {}

const Feed: React.FC<FeedProps> = ({}) => {
  const [groupSelected, setGroupSelected] = useState('');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [closed, setClosed] = useState(false);
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
      await SwitchOnline({ variables: { authorid: currentUser.id, value: true } });
      await SetChatOn({ variables: { authorid: currentUser.id, groupid: '' } });
      window.addEventListener('beforeunload', function (e) {
        SwitchOnline({ variables: { authorid: currentUser.id, value: false } });
        window.addEventListener('beforeunload', async function (e) {
          SwitchOnline({ variables: { authorid: currentUser.id, value: false } });
          for (var i = 0; i < 5000000; i++) {}
          return undefined;
        });
      });
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
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_GROUPS, {
    variables: { query, authorid: user?.id },
  });
  const { data: messageData, loading: messageLoading } = useQuery(GET_INITIAL_MESSAGES, {
    variables: { groupid: groupSelected },
  });
  const { data: realtimeData } = useSubscription(GET_ALL_MESSAGES);
  const [SwitchOnline] = useMutation(SWITCH_ONLINE);
  const [SetChatOn] = useMutation(SET_CHAT_ON);

  useEffect(() => {
    if (user && user.dark_theme === 'true') {
      (document.body.style as any) = 'background: #1A202C';
    }
    window.scrollTo(0, document.body.scrollHeight);
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
  }, [session, groupSelected, messageData, realtimeData, user?.dark_theme]);
  const [UpdateTime] = useMutation(UPDATE_TIME);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!session && !token) {
      router.push('/login');
    }
  }, [session]);

  if (loading)
    return (
      <div className={feedStyles.centered}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
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
          backgroundColor: darkMode ? '#000' : '',
        }}
      ></div>
      <div>
        {groupSelected === '' && (
          <>
            <div
              style={{
                position: 'fixed',
                top: '46%',
                left: '55%',
              }}
            >
              <i className="fa fa-comment fa-5x icon-3d" style={{ color: darkMode ? '#fff' : 'gray' }}></i>
            </div>
            <p
              style={{
                top:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? '60%'
                    : '58%',
                position: 'fixed',
                left:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? '44.7%'
                    : '46.2%',
                color: darkMode ? '#fff' : '#000',
              }}
            >
              To start, select a group on the left hand side or create a new group.
            </p>
          </>
        )}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: 100,
          }}
        >
          <div className="outer-menu">
            <input className="checkbox-toggle" type="checkbox" onChange={() => setVisible(!visible)} />
            <div className="hamburger rainbow-box" style={{ borderRadius: 50, backgroundColor: 'transparent' }}>
              <div>
                <i
                  className={`fa fa-${visible ? 'user-plus' : 'plus'} fa-2x`}
                  style={{ color: darkMode ? '#fff' : '' }}
                ></i>
              </div>
            </div>

            <div className="menu">
              <div style={{ marginRight: '22%', backgroundColor: darkMode ? '#000' : '' }}>
                <div>
                  <div className="mt-1" style={{ width: '300%', color: darkMode ? '#fff' : '#000' }}>
                    <Search />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
          }}
        ></div>
        <div
          className={feedStyles.leftsidebar}
          style={{
            backgroundColor: darkMode ? '#0A0514' : '',
            borderRightColor: darkMode ? '#4E4F51' : '',
            overflowY: 'auto',
            overflowX: 'hidden',
            height:
              (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
              (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? '110vh'
                : '87vh',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              marginRight: 35,
              marginTop: 15,
              color: darkMode ? '#fff' : '#000',
            }}
            className={tw('text-3xl font-bold')}
          >
            Your Chats
          </h1>
          <div className="search-box" style={{ backgroundColor: !darkMode ? '#eeeeee' : '#202327', top: 86 }}>
            <input
              className="search-txt"
              type="text"
              name=""
              placeholder="Search for chats..."
              value={query}
              style={{ color: !darkMode ? '#000' : '', paddingRight: 40, outline: 'none' }}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <a className="search-btn" style={{ backgroundColor: !darkMode ? 'transparent' : '#202327' }}>
              <i className="fa fa-search" style={{ color: '#4097ff' }}></i>
            </a>
          </div>
          <br />
          <br />
          <br />
          {searchLoading && (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              style={{ left: 190, position: 'relative', top: 30 }}
            />
          )}
          {searchData &&
            searchData.SearchGroups.map((group) => {
              if (group.dm) {
                return (
                  <div
                    style={{
                      backgroundColor: group.id === groupSelected ? (!darkMode ? '#E9EAEB' : '#2D2835') : '',
                    }}
                    className={darkMode ? feedStyles.sidebarcontent : feedStyles.sidebarcontentlight}
                    key={group.id}
                    onClick={(e: any) => {
                      e.preventDefault();
                      delete e['returnValue'];
                      // setTimeout(() => {
                      //   setMessageLoader(true);
                      //   window.history.pushState('', '', `/chat/${group.id}`);
                      //   const url = window.location.href;
                      //   const id = url.substring(url.lastIndexOf('/') + 1);
                      //   setGroupSelected(id);
                      //   GetInitalMessagesRefetch({ groupid: id, offset: 0, limit });
                      //   onlineRefetch({ groupid: id });
                      // }, 100);
                      window.addEventListener('beforeunload', (e) => {
                        e.preventDefault();
                        delete e['returnValue'];
                      });
                      window.history.pushState('', '', `/chat/${group.id}`);
                      window.location.reload(true);
                      // setTimeout(() => {
                      //   setMessageLoader(false);
                      // }, 1000);
                    }}
                  >
                    {user &&
                    group.last_message.body !== null &&
                    group.last_message.author.id !== user.id &&
                    !group.last_message.read_by.includes(user.id) ? (
                      <div className="newmessagedot" style={{ top: 37, position: 'absolute', left: 380 }}></div>
                    ) : null}
                    {group.members[0].id === user?.id ? (
                      <div style={{ marginTop: '-1%', marginLeft: '3%', paddingTop: '3%' }}>
                        <img
                          src={group.members[1].profile_picture}
                          alt=""
                          style={{ width: 54, height: 54, borderRadius: 125 }}
                        />
                        {group.members[1].online ? (
                          <div className="onlinedot" style={{ position: 'absolute', bottom: 15, left: 63 }} />
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '-1%', marginLeft: '2%', paddingTop: '3%' }}>
                        <img
                          src={group.members[0].profile_picture}
                          alt=""
                          style={{ width: 54, height: 54, borderRadius: 125 }}
                        />
                        {group.members[0].online ? (
                          <div className="onlinedot" style={{ position: 'absolute', bottom: 15, left: 63 }} />
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                    {group.dm ? (
                      <>
                        <p
                          style={{
                            fontWeight:
                              user &&
                              group.last_message.body !== null &&
                              group.last_message.author.id !== user.id &&
                              !group.last_message.read_by.includes(user.id)
                                ? 'bold'
                                : 'normal',
                            fontFamily: 'Lato',
                            color: darkMode ? '#fff' : '#000',
                            position: 'relative',
                            fontSize: 20,
                            bottom: 52,
                            left: 75,
                          }}
                          className={feedStyles.groupName}
                        >
                          {group.members[0].id === user?.id ? group.members[1].username : group.members[0].username}
                        </p>
                        {group.last_message.body === null ? null : (
                          <p
                            style={{
                              fontFamily: 'Lato',
                              color: darkMode ? '#fff' : '#000',
                              fontWeight:
                                user &&
                                group.last_message.body !== null &&
                                group.last_message.author.id !== user.id &&
                                !group.last_message.read_by.includes(user.id)
                                  ? 'bold'
                                  : 'normal',
                              position: 'relative',
                              bottom: 52,
                              left: 75,
                            }}
                            className={feedStyles.groupName}
                          >
                            {group.last_message.author.id !== user?.id ? group.last_message.author.username : 'You'}:{' '}
                            {group.last_message.body.includes('has left') && group.last_message.alert
                              ? '(Left The Group)'
                              : group.last_message.alert && group.last_message.body.includes('kicked')
                              ? '(Kicked Member From Group)'
                              : group.last_message.alert &&
                                !group.last_message.body.includes('kicked') &&
                                !group.last_message.body.includes('added') &&
                                !group.last_message.body.includes('left')
                              ? '(Changed The Group Name)'
                              : group.last_message.body.includes('added') && group.last_message.alert
                              ? '(Added Member To Group)'
                              : group.last_message.body.length <= 31
                              ? group.last_message.body
                              : `${group.last_message.body.substr(0, 28)}...`}
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>
                );
              } else if (!group.dm) {
                const restOfPeople = group.members.length - 2;
                return (
                  <div
                    style={{
                      backgroundColor: group.id === groupSelected ? (!darkMode ? '#E9EAEB' : '#2D2835') : '',
                    }}
                    className={darkMode ? feedStyles.sidebarcontent : feedStyles.sidebarcontentlight}
                    key={group.id}
                    // onClick={() => {
                    //   window.history.pushState('', '', `/chat/${group.id}`);
                    //   window.location.reload(true);
                    // }}
                    onClick={(e: any) => {
                      window.addEventListener('beforeunload', (e) => {
                        e.preventDefault();
                        delete e['returnValue'];
                      });
                      window.history.pushState('', '', `/chat/${group.id}`);
                      window.location.reload(true);
                      // setTimeout(() => {
                      //   setMessageLoader(true);
                      //   window.history.pushState('', '', `/chat/${group.id}`);
                      //   const url = window.location.href;
                      //   const id = url.substring(url.lastIndexOf('/') + 1);
                      //   setGroupSelected(id);
                      //   GetInitalMessagesRefetch({ groupid: id, offset: 0, limit });
                      //   onlineRefetch({ groupid: id });
                      // }, 100);
                      // setTimeout(() => {
                      //   setMessageLoader(false);
                      // }, 1000);
                    }}
                  >
                    {user &&
                    group.last_message.body !== null &&
                    group.last_message.author.id !== user.id &&
                    !group.last_message.read_by.includes(user.id) ? (
                      <div className="newmessagedot" style={{ top: 37, position: 'absolute', left: 380 }}></div>
                    ) : null}
                    {group.image.length === 0 && user && group.members.length === 1 ? (
                      <img
                        src={user.profile_picture as any}
                        alt=""
                        style={{ width: 54, height: 54, borderRadius: 125, top: 10, position: 'relative', left: 10 }}
                      />
                    ) : null}
                    {group.image.length === 0 && user && group.members.length >= 2 ? (
                      <>
                        <div
                          style={{
                            position: 'relative',
                            bottom: 6,
                            right: 8,
                            marginLeft: group.members.length === 2 ? 10 : -2,
                          }}
                        >
                          <div style={{ marginLeft: '7%', paddingTop: '3%' }}>
                            <img
                              src={group.members[0].profile_picture}
                              alt=""
                              style={{ width: 30, height: 30, borderRadius: 25, position: 'relative', top: 3 }}
                            />
                          </div>

                          <div style={{ marginLeft: 17 }}>
                            <img
                              src={group.members[1].profile_picture}
                              alt=""
                              style={{ width: 30, height: 30, borderRadius: 25 }}
                            />
                          </div>
                        </div>
                      </>
                    ) : group.image.length > 0 ? (
                      <div>
                        <img
                          src={group.image}
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 125,
                            position: 'relative',
                            top: 5,
                            left: 10,
                          }}
                          alt=""
                        />
                      </div>
                    ) : null}
                    {group.image.length === 0 && (
                      <div
                        className={`${feedStyles.dot} text-center`}
                        style={{
                          width: 29,
                          height: 29,
                          position: 'relative',
                          left: -5,
                          top: -35,
                          display: restOfPeople < 1 ? 'none' : '',
                        }}
                      >
                        <p style={{ position: 'relative', top: 3, right: 2 }}>+{restOfPeople}</p>
                      </div>
                    )}

                    <p
                      style={{
                        fontWeight:
                          user &&
                          group.last_message.body !== null &&
                          group.last_message.author.id &&
                          group.last_message.author.id !== user.id &&
                          !group.last_message.read_by.includes(user.id)
                            ? 'bold'
                            : 'normal',
                        fontFamily: 'Lato',
                        color: darkMode ? '#fff' : '#000',
                        position: 'relative',
                        bottom:
                          group.image.length === 0 && group.members.length === 1
                            ? 47
                            : group.image.length === 0 && restOfPeople !== 0
                            ? 94
                            : group.image.length === 0 && restOfPeople === 0
                            ? 65
                            : 50,
                        fontSize: 20,
                        left: group.image.length === 0 ? 76 : 80,
                      }}
                    >
                      {group.name}
                    </p>
                    {group.last_message.body === null ? null : (
                      <p
                        style={{
                          fontFamily: 'Lato',
                          color: darkMode ? '#fff' : '#000',
                          position: 'relative',
                          fontWeight:
                            user &&
                            group.last_message.body !== null &&
                            group.last_message.author.id &&
                            group.last_message.author.id !== user.id &&
                            !group.last_message.read_by.includes(user.id)
                              ? 'bold'
                              : 'normal',
                          bottom:
                            group.image.length === 0 && group.members.length === 1
                              ? 47
                              : group.image.length === 0 && restOfPeople !== 0
                              ? 94
                              : group.image.length === 0 && restOfPeople === 0
                              ? 68
                              : 50,
                          left: group.image.length === 0 ? 78 : 83,
                        }}
                        className={feedStyles.groupName}
                      >
                        {group.last_message.author.id !== user?.id ? group.last_message.author.username : 'You'}:{' '}
                        {group.last_message.body.includes('has left') && group.last_message.alert
                          ? '(Left The Group)'
                          : group.last_message.alert && group.last_message.body.includes('kicked')
                          ? '(Kicked Member From Group)'
                          : group.last_message.alert &&
                            !group.last_message.body.includes('kicked') &&
                            !group.last_message.body.includes('added')
                          ? '(Changed The Group Name)'
                          : group.last_message.body.includes('added') && group.last_message.alert
                          ? '(Added Member To Group)'
                          : group.last_message.body.length <= 31
                          ? group.last_message.body
                          : `${group.last_message.body.substr(0, 28)}...`}
                      </p>
                    )}
                  </div>
                );
              }
            })}
        </div>
        <div
          className={feedStyles.profile}
          style={{
            backgroundColor: darkMode ? '#0A0514' : '',
            borderRightColor: darkMode ? '#4E4F51' : '',
            borderBottomColor: !darkMode ? '#EEEEEE' : '#4E4F51',
          }}
        >
          <div
            style={{ position: 'fixed', zIndex: 1, left: 77, top: 70, width: 20, height: 20 }}
            className="onlinedot"
          ></div>

          <div style={{ marginLeft: 120, marginTop: 17 }}>
            <h1
              className={tw('text-primary-100 font-bold')}
              style={{
                textAlign: 'left',
                display: 'inline',
                color: darkMode ? '#fff' : '#000',
                fontSize: 22,
                bottom: -5,
                fontFamily: 'Lato',
                position: 'relative',
                marginTop: 19,
              }}
            >
              {user && user.username}
            </h1>
            <div>
              <h1
                style={{
                  fontSize: 18,
                  bottom: -3,
                  display: 'inline-block',
                  fontFamily: 'Lato',
                  position: 'relative',
                  color: darkMode ? '#fff' : '#000',
                }}
              >
                {user && user.email}
              </h1>
            </div>
          </div>
          <div className="conic-gradient"></div>
          <div style={{ cursor: 'pointer' }}>
            <img
              src={user! && (user.profile_picture as string | undefined)}
              onClick={() => (window.location.href = '/me')}
              alt=""
              style={{
                width: 75,
                height: 75,
                borderRadius: 35,
                top: 11,
                marginLeft: '5.2%',
                position: 'absolute',
                zIndex: -1,
                WebkitBorderRadius: 35,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Feed;
