import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/client';
import feedStyles from '../../styles/feed.module.css';
import client from '@/../apollo-client';
import { IconButton } from '@material-ui/core';
import {
  GET_CHAT_PATHS,
  GET_GROUPS,
  GET_GROUP_NAME,
  GET_INITIAL_MESSAGES,
  GET_MEMBERS,
  GET_USER_ID,
  LOAD_MORE,
  SEARCH_GROUPS,
} from '../../apollo/Queries';
import { Search } from '../../components/Search';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import EjectIcon from '@material-ui/icons/Eject';
import { SEND_MESSAGE, SET_CHAT_ON, SWITCH_ONLINE, TOGGLE_THEME } from '@/apollo/Mutations';
import { generateId } from '@/../utils/GenerateId';
import Head from 'next/head';
import { GET_ALL_MESSAGES } from '@/apollo/Subscriptions';
import { Picker } from 'emoji-mart';
import { useRouter } from 'next/dist/client/router';
import { animateScroll } from 'react-scroll';
import { InputGroup, InputRightElement, Skeleton, SkeletonCircle, useToast, Spinner, Textarea } from '@chakra-ui/react';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import { formatAMPM } from '@/../utils/formatTime';
import { tw } from 'twind';
import { isUrl } from '@/../utils/isUrl';
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
    fallback: true,
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
  const [query, setQuery] = useState('');
  const [loader, setLoader] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [limit, setLimit] = useState(9);
  const [offset, setOffset] = useState(10);
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [closed, setClosed] = useState(false);
  const [messageVal, setMessageVal] = useState('');
  const [session] = useSession();
  const chatRef = useRef<null | HTMLElement>();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    dark_theme: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
  } | null>(null);

  const GetUser = async () => {
    if (session) {
      const result = await client.query({ query: GET_USER_ID, variables: { email: session.user.email } });
      const currentUser: {
        username: string;
        email: string;
        id: string;
        profile_picture: string;
        dark_theme: string;
        online: boolean;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId[0],
        dark_theme: result.data.GetUserId[1],
        online: true,
        profile_picture: session.user.image!,
      };
      setDarkMode(currentUser.dark_theme === 'true' ? true : false);
      setUser(currentUser);
      await SwitchOnline({ variables: { authorid: currentUser.id, value: true } });
      await SetChatOn({ variables: { authorid: currentUser.id, groupid: groupSelected } });
      window.addEventListener('beforeunload', function (e) {
        SwitchOnline({ variables: { authorid: currentUser.id, value: false } });
        var start = Date.now(),
          now = start;
        var delay = 60; // msec
        while (now - start < delay) {
          now = Date.now();
        }
        delete e['returnValue'];
      });
    }
  };

  const toast = useToast();

  const { data, loading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });
  const { data: messageData, loading: messageLoading, refetch: GetInitalMessagesRefetch } = useQuery(
    GET_INITIAL_MESSAGES,
    {
      variables: { groupid: groupSelected, limit, offset: 0 },
    },
  );
  const { data: loadMoreData, loading: loadMoreLoading } = useQuery(LOAD_MORE, {
    variables: {
      limit,
      offset,
      groupid: groupSelected,
    },
  });
  const { data: searchData, loading: searchLoading, refetch: searchDataRefetch } = useQuery(SEARCH_GROUPS, {
    variables: { query, authorid: user?.id },
  });
  const [SendMessage] = useMutation(SEND_MESSAGE);
  const { data: realtimeData } = useSubscription(GET_ALL_MESSAGES);
  const { data: GroupNameData, loading: GroupNameLoading } = useQuery(GET_GROUP_NAME, {
    variables: { groupid: groupSelected },
  });
  const { data: onlineData, loading: onlineLoading, refetch: onlineRefetch } = useQuery(GET_MEMBERS, {
    variables: {
      groupid: groupSelected,
    },
  });
  const [ToggleTheme] = useMutation(TOGGLE_THEME);
  const [SwitchOnline] = useMutation(SWITCH_ONLINE);
  const [SetChatOn] = useMutation(SET_CHAT_ON);

  const playSound = () => {
    const audio: any = document.getElementById('sound');
    if (audio) {
      (audio as HTMLMediaElement).play();
    }
  };

  useEffect(() => {
    const el = document.getElementById('chatDiv');
    if (el) el.scrollTop = el.scrollHeight;
    searchDataRefetch();
  }, [messages, realtimeData, messageData]);

  useEffect(() => {
    if (typeof messageData !== 'undefined') {
      const messages = [...messageData.GetInitialMessages];
      setMessages(messages.reverse());
    }
  }, [typeof messageData]);

  const refetchOnline = async () => {
    await onlineRefetch({ groupid: groupSelected });
  };

  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById('chatDiv');
      if (el) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
      }
    }, 800); // Load time
  }, []);

  useEffect(() => {
    (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
    (typeof window !== 'undefined' && window.screen.availWidth) < 1800
      ? ((document.body.style as any) = 'overflow: hidden; zoom: 0.8;')
      : 'overflow: hidden; zoom: 1;';

    if (user && user.dark_theme === 'true') {
      (document.body.style as any) = 'background: #0C0E12';
    }
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }

    setInterval(() => {
      if (document.visibilityState === 'hidden' && user) {
        SetChatOn({ variables: { authorid: user.id, groupid: '' } });
      }
    }, 15000);
    setInterval(() => {
      if (document.visibilityState === 'visible' && user) {
        SetChatOn({ variables: { authorid: user.id, groupid: groupSelected } });
      }
    }, 15000);

    setInterval(() => {
      refetchOnline();
    }, 15000);

    const el = document.getElementById('chatDiv');
    if (el) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }

    if (realtimeData && messages.includes(realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1])) return;
    if (
      document.visibilityState === 'hidden' &&
      realtimeData &&
      realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].author.id !== user?.id &&
      !messages.includes(realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1])
    ) {
      playSound();
    }
    if (
      realtimeData &&
      realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].author.id !== user?.id &&
      realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].groupid === groupSelected
    ) {
      setMessages([...messages, realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1]]);
    }

    setGroupSelected(currId);

    GetUser();
  }, [session, messageData, realtimeData, user?.dark_theme]);

  var today: any = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var day = days[new Date().getDay()];

  today = mm + '/' + dd + '/' + yyyy;

  if (loading || router.isFallback)
    return (
      <div className={feedStyles.centered}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );

  return (
    <>
      <audio className="audio-element" id="sound">
        <source src="/sound/chatpadsound.mp3"></source>
      </audio>
      <Head>
        <title>ChatPad</title>
        <link rel="icon" href="/images/chatpadlogo.png" />
      </Head>
      <div>
        {GroupNameData && groupSelected !== '' && groupSelected !== undefined && groupSelected !== null && (
          <nav
            className="navbar navbar-light"
            style={{
              background: darkMode ? '#1c1c1c' : '#fff',
              position: 'relative',
              height: 100,
            }}
          >
            <span
              className="navbar-brand mb-0 h1"
              style={{ marginLeft: GroupNameData.GetGroupName.members.length === 2 ? 640 : 550, display: 'inline' }}
            >
              {GroupNameData.GetGroupName.members.length === 2 ? (
                <>
                  {GroupNameData.GetGroupName.members[0].id === user?.id ? (
                    <img
                      src={GroupNameData.GetGroupName.members[1].profile_picture}
                      style={{ width: 54, height: 54, borderRadius: 100, display: 'inline' }}
                      alt=""
                    />
                  ) : (
                    <SkeletonCircle
                      style={{ position: 'relative', display: 'inline', width: 100 }}
                      isLoaded={!GroupNameLoading}
                    >
                      <img
                        src={GroupNameData.GetGroupName.members[0].profile_picture}
                        alt=""
                        style={{ width: 54, height: 54, borderRadius: 125, display: 'inline' }}
                      />
                    </SkeletonCircle>
                  )}
                </>
              ) : GroupNameData.GetGroupName.members.length > 2 ? (
                <>
                  <div style={{ display: 'inline', position: 'relative', left: 50 }}>
                    <img
                      src={GroupNameData.GetGroupName.members[0].profile_picture}
                      style={{
                        width: 31,
                        height: 31,
                        borderRadius: 100,
                        display: 'inline',
                        position: 'relative',
                        top: 8,
                        left: 18,
                      }}
                      alt=""
                    />{' '}
                    <img
                      src={GroupNameData.GetGroupName.members[1].profile_picture}
                      style={{
                        width: 31,
                        height: 31,
                        borderRadius: 100,
                        display: 'inline',
                        position: 'relative',
                        top: -10,
                        right: 5,
                      }}
                      alt=""
                    />
                    <div
                      className={feedStyles.navdot}
                      style={{ position: 'relative', top: 10, right: 60, width: 30, height: 30 }}
                    >
                      <p style={{ position: 'relative', left: 2, top: 2 }}>
                        +{GroupNameData.GetGroupName.members.length - 2}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
              {GroupNameData.GetGroupName.members.length === 2 ? (
                <p
                  style={{
                    display: 'inline',
                    fontFamily: 'Lato',
                    fontWeight: 'bold',
                    fontSize: 28,
                    marginLeft: GroupNameData.GetGroupName.members.length === 2 ? 10 : '',
                    color: darkMode ? '#fff' : '#000',
                  }}
                >
                  {GroupNameData.GetGroupName.members[0].id === user?.id
                    ? GroupNameData.GetGroupName.members[1].username
                    : GroupNameData.GetGroupName.members[0].username}
                </p>
              ) : null}
              {GroupNameData.GetGroupName.members.length > 2 && (
                <p
                  style={{
                    display: 'inline',
                    fontFamily: 'Lato',
                    fontWeight: 'bold',
                    fontSize: 28,
                    marginLeft: GroupNameData.GetGroupName.members.length === 2 ? 10 : '',
                    color: darkMode ? '#fff' : '#000',
                  }}
                >
                  {GroupNameData.GetGroupName.name}
                </p>
              )}
              {(messageData && messageData.GetInitialMessages.length === 0) ||
              (realtimeData && realtimeData.GetAllMessages.length === 0) ? null : (
                <p
                  style={{
                    fontSize: 12,
                    fontFamily: 'Lato',
                    position: 'relative',
                    textAlign: 'left',
                    color: darkMode ? '#fff' : '#000',
                    bottom: GroupNameData.GetGroupName.members.length === 2 ? 15 : 5,
                    marginLeft:
                      GroupNameData.GetGroupName.members.length === 2
                        ? 66
                        : GroupNameData.GetGroupName.members.length > 2
                        ? 137
                        : 50,
                  }}
                >
                  {messages && messages[messages.length - 1] && messages[messages.length - 1].time
                    ? Math.round((Date.now() - messages[messages.length - 1].time) / 60000) >= 1 &&
                      Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 2
                      ? 'Last active ' +
                        Math.round((Date.now() - messages[messages.length - 1].time) / 60000) +
                        ' minute ago'
                      : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) > 0 &&
                        Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 60
                      ? 'Last active ' +
                        Math.round((Date.now() - messages[messages.length - 1].time) / 60000) +
                        ' minutes ago'
                      : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) > 60 &&
                        Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 1440
                      ? `Last active ${
                          day === messages[messages.length - 1].date[2]
                            ? 'today'
                            : `on ${messages[messages.length - 1].date[2]}`
                        } at ` + messages[messages.length - 1].date[1]
                      : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) > 1440 &&
                        Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 10080
                      ? 'Last active on ' +
                        messages[messages.length - 1].date[2] +
                        ' at ' +
                        messages[messages.length - 1].date[1]
                      : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) >= 10080
                      ? `Last active on ${messages[messages.length - 1].date[0]} at ${
                          messages[messages.length - 1].date[1]
                        }`
                      : ' Currently active'
                    : null}
                </p>
              )}
            </span>
          </nav>
        )}
        <div
          onClick={() => setShowEmoji(false)}
          style={{
            overflowY: 'auto',
            flexDirection: 'column',
            height:
              (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
              (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? messageVal.length <= 88
                  ? '90vh'
                  : '77vh'
                : messageVal.length <= 88
                ? '69vh'
                : '63vh', // Screen size monitor different height from laptop
            overflowX: 'hidden',
            backgroundColor: darkMode ? '#1c1c1c' : '#fff',
          }}
          id="chatDiv"
          ref={chatRef as any}
        >
          {messages.length !== 0 && loadMoreData && loadMoreData.LoadMore.length !== 0 && (
            <IconButton
              onClick={() => {
                if (!loadMoreData || loadMoreLoading) return setLoader(true);
                setOffset(offset + 10);
                const dataLoadMore = [...loadMoreData.LoadMore];
                console.log('LOADMORE', dataLoadMore);
                setMessages([...dataLoadMore.reverse(), ...messages]);
                setLoader(false);
              }}
              style={{ color: '#fff', left: 1000 }}
              className={feedStyles.loadmorebtn}
              children={<EjectIcon style={{ width: '4vh', height: '4vh' }} />}
            ></IconButton>
          )}
          {loader && (
            <div style={{ backgroundColor: darkMode ? '#1c1c1c' : '#fff' }}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
                style={{ left: 1000, position: 'relative', top: 10 }}
              />
            </div>
          )}

          {groupSelected !== '' &&
            messageData &&
            user &&
            messages.map((message) => {
              return (
                <React.Fragment key={message.messageid}>
                  <div>
                    <div
                      style={{
                        position: 'relative',
                        left: 372,
                        top: 75,
                      }}
                    >
                      {message.author.id !== user.id ? (
                        <img
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 100,
                            left: 129,
                            top: 8,
                            position: 'relative',
                          }}
                          src={message.author.profile_picture}
                          alt=""
                        />
                      ) : null}
                    </div>

                    {message.author.id !== user.id ? (
                      <p
                        style={{
                          color: darkMode ? '#ebeef0' : '#000',
                          position: 'relative',
                          left: 579,
                          top: 10,
                          fontSize: 14,
                          fontFamily: 'Lato',
                        }}
                      >
                        {message.author.username} •{' '}
                        {Math.round((Date.now() - message.time) / 60000) >= 1 &&
                        Math.round((Date.now() - message.time) / 60000) < 2
                          ? Math.round((Date.now() - message.time) / 60000) + ' minute ago'
                          : Math.round((Date.now() - message.time) / 60000) > 0 &&
                            Math.round((Date.now() - message.time) / 60000) < 60
                          ? Math.round((Date.now() - message.time) / 60000) + ' minutes ago'
                          : Math.round((Date.now() - message.time) / 60000) > 60 &&
                            Math.round((Date.now() - message.time) / 60000) < 1440
                          ? message.date[1]
                          : Math.round((Date.now() - message.time) / 60000) > 1440 &&
                            Math.round((Date.now() - message.time) / 60000) < 10080
                          ? message.date[2] + ', ' + message.date[1]
                          : Math.round((Date.now() - message.time) / 60000) > 1440
                          ? message.date[1] + ' ' + message.date[0]
                          : ' Now'}
                      </p>
                    ) : (
                      <p
                        style={{
                          color: darkMode ? '#ebeef0' : '#000',
                          position: 'relative',
                          fontFamily: 'Lato',
                          left:
                            Math.round((Date.now() - message.time) / 60000) > 0 &&
                            Math.round((Date.now() - message.time) / 60000) < 60
                              ? 1575
                              : Math.round((Date.now() - message.time) / 60000) > 60 &&
                                Math.round((Date.now() - message.time) / 60000) < 1440
                              ? 1610
                              : Math.round((Date.now() - message.time) / 60000) > 1440
                              ? 1535
                              : 1625,
                          top: 10,
                          fontSize: 14,
                        }}
                      >
                        You •{' '}
                        {Math.round((Date.now() - message.time) / 60000) >= 1 &&
                        Math.round((Date.now() - message.time) / 60000) < 2
                          ? Math.round((Date.now() - message.time) / 60000) + ' minute ago'
                          : Math.round((Date.now() - message.time) / 60000) > 0 &&
                            Math.round((Date.now() - message.time) / 60000) < 60
                          ? Math.round((Date.now() - message.time) / 60000) + ' minutes ago'
                          : Math.round((Date.now() - message.time) / 60000) > 60 &&
                            Math.round((Date.now() - message.time) / 60000) < 1440
                          ? message.date[1]
                          : Math.round((Date.now() - message.time) / 60000) > 1440 &&
                            Math.round((Date.now() - message.time) / 60000) < 10080
                          ? message.date[2] + ', ' + message.date[1]
                          : Math.round((Date.now() - message.time) / 60000) > 1440
                          ? message.date[1] + ' ' + message.date[0]
                          : ' Now'}
                      </p>
                    )}
                    <div
                      className={
                        message.author.id === user.id && user.dark_theme === 'true'
                          ? feedStyles.yourmessage
                          : message.author.id === user.id && user.dark_theme === 'false'
                          ? feedStyles.yourmessagelight
                          : message.author.id !== user.id && user.dark_theme === 'true'
                          ? feedStyles.message
                          : feedStyles.messagelight
                      }
                      style={{
                        marginBottom: message.author.id !== user.id ? -40 : -4,
                      }}
                    >
                      {message.image ? (
                        <img
                          style={{
                            marginLeft: 5,
                            marginTop: 10,
                            fontSize: 20,
                            width: 900,
                            borderRadius: 50,
                            height: '100%',
                          }}
                          src={message.body}
                          className={feedStyles.text}
                        />
                      ) : isUrl(message.body) ? (
                        <p
                          style={{
                            marginLeft: 5,
                            marginTop: 10,
                            fontSize: 20,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                          onClick={() => window.open(message.body)}
                          className={feedStyles.text}
                        >
                          {message.body}
                        </p>
                      ) : (
                        <p
                          style={{
                            marginLeft: 5,
                            marginTop: 10,
                            fontSize: 20,
                          }}
                          className={feedStyles.text}
                        >
                          {message.body}
                        </p>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
        </div>

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
              <div style={{ marginRight: '22%', backgroundColor: darkMode ? '#1C1C1C' : '' }}>
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
          className={feedStyles.leftsidebar}
          style={{
            backgroundColor: darkMode ? '#1c1c1c' : '#EDEDED',
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
            className={tw('text-3xl text-primary-100')}
          >
            Chats
          </h1>

          <div className="search-box" style={{ backgroundColor: !darkMode ? '#fff' : '', top: 86, outline: 'none' }}>
            <input
              className="search-txt"
              type="text"
              name=""
              placeholder="Search for chats..."
              value={query}
              style={{ color: !darkMode ? '#000' : '', paddingRight: 40, outline: 'none' }}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <a className="search-btn" style={{ backgroundColor: !darkMode ? 'transparent' : '' }}>
              <i className="fa fa-search" style={{ color: '#4097ff' }}></i>
            </a>
          </div>
          <br />
          <br />
          <br />

          {searchData &&
            searchData.SearchGroups.map((group) => {
              if (group.members.length === 2) {
                return (
                  <div
                    style={{
                      backgroundColor: group.id === groupSelected ? (!darkMode ? '#c5e2ed' : '#144e80') : '',
                    }}
                    className={darkMode ? feedStyles.sidebarcontent : feedStyles.sidebarcontentlight}
                    key={group.id}
                    onClick={() => {
                      window.history.pushState('', '', `/chat/${group.id}`);
                      window.location.reload(true);
                    }}
                  >
                    {group.members[0].id === user?.id ? (
                      <div style={{ marginTop: '3%', marginLeft: '3%', paddingTop: '3%' }}>
                        <img
                          src={group.members[1].profile_picture}
                          alt=""
                          style={{ width: 54, height: 54, borderRadius: 125 }}
                        />
                        {group.members[1].online ? (
                          <div className="onlinedot" style={{ position: 'absolute', bottom: 19, left: 48 }} />
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '3%', marginLeft: '3%', paddingTop: '3%' }}>
                        <img
                          src={group.members[0].profile_picture}
                          alt=""
                          style={{ width: 54, height: 54, borderRadius: 125 }}
                        />
                        {group.members[0].online ? (
                          <div className="onlinedot" style={{ position: 'absolute', bottom: 19, left: 48 }} />
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                    {group.members.length === 2 ? (
                      <>
                        <p
                          style={{
                            fontWeight: groupSelected === group.id ? 'bold' : 'normal',
                            fontFamily: 'Lato',
                            color: darkMode ? '#fff' : '#000',
                            position: 'relative',
                            fontSize: 20,
                            bottom: 50,
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
                              position: 'relative',
                              bottom: 50,
                              left: 75,
                            }}
                            className={feedStyles.groupName}
                          >
                            {group.last_message.author.id !== user?.id ? group.last_message.author.username : 'You'}:{' '}
                            {group.last_message.body.length <= 31
                              ? group.last_message.body
                              : `${group.last_message.body.substr(0, 28)}...`}
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>
                );
              } else if (group.members.length > 2) {
                const restOfPeople = group.members.length - 2;
                return (
                  <div
                    style={{ backgroundColor: group.id === groupSelected ? (!darkMode ? '#c5e2ed' : '#144e80') : '' }}
                    className={darkMode ? feedStyles.sidebarcontent : feedStyles.sidebarcontentlight}
                    key={group.id}
                    onClick={() => {
                      window.history.pushState('', '', `/chat/${group.id}`);
                      window.location.reload(true);
                    }}
                  >
                    <div style={{ marginTop: '3%', marginLeft: '6%', paddingTop: '3%' }}>
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
                        color: darkMode ? '#fff' : '#000',
                        position: 'relative',
                        bottom: 85,
                        fontSize: 20,
                        left: 75,
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
                          bottom: 85,
                          left: 78,
                        }}
                        className={feedStyles.groupName}
                      >
                        {group.last_message.author.id !== user?.id ? group.last_message.author.username : 'You'}:{' '}
                        {group.last_message.body.length <= 31
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
            backgroundColor: darkMode ? '#1c1c1c' : '#EDEDED',
            borderRightColor: darkMode ? '#4E4F51' : '',
            borderBottomColor: !darkMode ? '#ccc' : '#4E4F51',
          }}
        >
          <div style={{ position: 'fixed', zIndex: 1, left: 74, top: 70 }} className="onlinedot"></div>

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
          <div style={{ cursor: 'pointer' }}>
            <img
              src={user! && (user.profile_picture as string | undefined)}
              onClick={() => (window.location.href = '/me')}
              alt=""
              style={{
                width: 75,
                height: 75,
                borderRadius: 35,
                top: 10,
                marginLeft: '5%',
                position: 'absolute',
                zIndex: -1,
              }}
            />
          </div>
        </div>
        <div
          style={{
            height:
              messageVal.length <= 88
                ? '20vh'
                : (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? '32.9vh'
                : '25vh',
            backgroundColor: darkMode ? '#1c1c1c' : '#fff',
            overflow: 'hidden',
          }}
        ></div>

        {groupSelected !== '' && user ? (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: darkMode ? '#0C0E12' : '#fff',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'relative',
              }}
            >
              <InputGroup size="lg" style={{ width: '50%', top: -78, height: 60, left: 610 }}>
                {onlineData &&
                  onlineData.GetMembers.map((member) => {
                    if (member.id !== user.id) {
                      return (
                        <div>
                          <img
                            src={member.profile_picture}
                            style={{
                              borderRadius: 100,
                              width: messageVal.length <= 88 ? 43 : 76,
                              position: 'relative',
                              bottom: messageVal.length <= 88 ? 45 : 128,
                              left:
                                onlineData.GetMembers.length === 3
                                  ? '220%'
                                  : onlineData.GetMembers.length === 2
                                  ? '150%'
                                  : onlineData.GetMembers.length === 4
                                  ? '300%'
                                  : onlineData.GetMembers.length === 5
                                  ? '390%'
                                  : onlineData.GetMembers.length === 6
                                  ? '510%'
                                  : '',
                              opacity: member.online && member.chaton === groupSelected ? 1 : 0.5,
                            }}
                            alt=""
                          />
                        </div>
                      );
                    }
                  })}
                <Textarea
                  placeholder="Send a message..."
                  style={{
                    color: darkMode ? '#fff' : '#000',
                    borderRadius: 10,
                    paddingRight: 100,
                    width: messageVal.length >= 88 ? 1500 : '',
                    backgroundColor: darkMode ? '#303640' : '#F4F4F4',
                    minHeight: messageVal.length <= 88 ? 10 : 150,
                    bottom: messageVal.length >= 88 ? 80 : 0,
                    lineHeight: 1.8,
                  }}
                  resize="none"
                  value={messageVal}
                  _placeholder={{ color: darkMode ? '#fff' : '#7c7c82' }}
                  onKeyPress={async (e) => {
                    if (e.shiftKey) {
                      return;
                    }
                    if (!messageVal.trim()) return;
                    if (e.key === 'Enter') {
                      const el = document.getElementById('chatDiv');
                      setMessages([
                        ...messages,
                        {
                          groupid: groupSelected,
                          body: messageVal,
                          author: {
                            username: user.username,
                            email: user.email,
                            id: user.id,
                            profile_picture: user.profile_picture,
                          },
                          image: false,
                          messageid: generateId(24),
                          date: today,
                          time: Date.now(),
                          day,
                        },
                      ]);
                      if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
                      setMessageVal('');
                      e.preventDefault();
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
                          image: false,
                          messageid: generateId(24),
                          time: formatAMPM(new Date()),
                          date: today,
                          day,
                        },
                      });
                    }
                  }}
                  onChange={(e) => {
                    setMessageVal(e.currentTarget.value);
                  }}
                  onClick={() => showEmoji && setShowEmoji(false)}
                />
                <InputRightElement
                  style={{
                    backgroundColor: 'transparent',
                    right: 24,
                    cursor: 'pointer',
                  }}
                >
                  {visible && (
                    <>
                      <InsertPhotoIcon
                        onClick={() => {
                          document.getElementById('filepicker')?.click();
                        }}
                        fontSize="large"
                        style={{
                          color: darkMode ? '#4097FF' : 'gray',
                          marginBottom: messageVal.length >= 88 ? 50 : '',
                        }}
                      />

                      <EmojiEmotionsIcon
                        onClick={() => setShowEmoji(!showEmoji)}
                        fontSize="large"
                        style={{
                          color: darkMode ? '#4097FF' : 'gray',
                          marginBottom: messageVal.length >= 88 ? 50 : '',
                        }}
                      />
                    </>
                  )}

                  <input
                    type="file"
                    id="filepicker"
                    accept="image/x-png,image/gif,image/jpeg"
                    onChange={(e: any) => {
                      const file = e.target.files[0];

                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
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
                              image: false,
                              messageid: generateId(24),
                              time: formatAMPM(new Date()),
                              date: today,
                              day,
                            },
                          });
                        } catch (err) {
                          toast({
                            status: 'error',
                            title: 'This image is too big! Please choose a smaller image.',
                            position: 'top-right',
                            isClosable: true,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{ display: 'none' }}
                  />
                </InputRightElement>
              </InputGroup>
            </div>
            {showEmoji && (
              <span>
                <Picker
                  style={{
                    position: 'absolute',
                    bottom: 100,
                    left:
                      (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                      (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                        ? 1420
                        : 1530,
                  }}
                  onSelect={(e: any) => {
                    let sym = e.unified.split('-');
                    let codesArray: any[] = [];
                    sym.forEach((el) => codesArray.push('0x' + el));
                    let emoji = String.fromCodePoint(...codesArray);
                    setMessageVal(messageVal + '' + emoji + '');
                  }}
                />
              </span>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Chat;
