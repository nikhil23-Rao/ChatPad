import React, { useEffect, useRef, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../../styles/feed.module.css';
import client from '@/../apollo-client';
import { GET_CHAT_PATHS, GET_GROUPS, GET_GROUP_NAME, GET_INITIAL_MESSAGES, GET_USER_ID } from '../../apollo/Queries';
import { Search } from '../../components/Search';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { IconButton } from '@material-ui/core';
import { SEND_MESSAGE, START_SUBSCRIPTION, TOGGLE_THEME } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import Head from 'next/head';
import { GET_ALL_MESSAGES } from '@/apollo/Subscriptions';
import { Picker } from 'emoji-mart';
import { useRouter } from 'next/dist/client/router';
import { GetStaticProps } from 'next';
import { Loader } from '@/components/loader';
import { animateScroll } from 'react-scroll';
import { Input, InputGroup, InputRightElement, Switch, Textarea, useToast } from '@chakra-ui/react';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
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
  const [showEmoji, setShowEmoji] = useState(false);
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
  };

  const toast = useToast();

  const { data, loading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });
  const { data: messageData, loading: messageLoading, refetch } = useQuery(GET_INITIAL_MESSAGES, {
    variables: { groupid: groupSelected },
  });
  const [SendMessage] = useMutation(SEND_MESSAGE);
  const [ToggleTheme] = useMutation(TOGGLE_THEME);
  const { data: realtimeData } = useSubscription(GET_ALL_MESSAGES);
  const { data: GroupNameData, loading: GroupNameLoading } = useQuery(GET_GROUP_NAME, {
    variables: { groupid: groupSelected },
  });

  const playSound = () => {
    const audio = document.getElementById('sound');
    if (audio) {
      (audio as HTMLMediaElement).play();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      animateScroll.scrollToBottom({
        containerId: 'chatDiv',
        smooth: false,
        duration: 0,
      });
    }, 180); // Load time

    console.log('CURRENT ID', currId);
    setGroupSelected(currId);
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    // if (data) {
    //   console.log(data);
    // }

    if (realtimeData) {
      console.log(realtimeData);
    }
    // console.log(messageData);
    // console.log(groupSelected);
    // console.log('REALTIME', realtimeData);
  }, [session, groupSelected, messageData, realtimeData]);

  //@TODO
  // useEffect(() => {
  //   document.addEventListener('visibilitychange', function () {
  //     if (document.visibilityState === 'hidden') {
  //       playSound();
  //     } else return;
  //   });
  // }, [realtimeData]);

  if (loading) return <Loader />;
  if (GroupNameLoading) return <Loader />;

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
              background: darkMode ? '#1A202C' : 'transparent',
              position: 'relative',
              height: 100,
            }}
          >
            <span className="navbar-brand mb-0 h1" style={{ marginLeft: 500, display: 'inline' }}>
              {GroupNameData.GetGroupName.members.length === 1 ? (
                <img
                  src={GroupNameData.GetGroupName.members[0].profile_picture}
                  style={{ width: 40, height: 40, borderRadius: 100, display: 'inline', marginRight: 10 }}
                  alt=""
                />
              ) : GroupNameData.GetGroupName.members.length === 2 ? (
                <>
                  <img
                    src={GroupNameData.GetGroupName.members[0].profile_picture}
                    style={{ width: 30, height: 30, borderRadius: 100, display: 'inline' }}
                    alt=""
                  />{' '}
                  <img
                    src={GroupNameData.GetGroupName.members[1].profile_picture}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 100,
                      display: 'inline',
                      marginRight: 10,
                      position: 'relative',
                      top: -10,
                      right: 10,
                    }}
                    alt=""
                  />
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
              <p
                style={{
                  display: 'inline',
                  fontFamily: 'Lato',
                  fontWeight: 'bold',
                  fontSize: 28,
                  color: darkMode ? '#fff' : '#000',
                }}
              >
                {GroupNameData.GetGroupName.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontFamily: 'Lato',
                  position: 'relative',
                  textAlign: 'left',
                  color: darkMode ? '#fff' : '#000',
                  bottom: 5,
                  marginLeft:
                    GroupNameData.GetGroupName.members.length === 2
                      ? 75
                      : GroupNameData.GetGroupName.members.length > 2
                      ? 131
                      : 50,
                }}
              >
                Last active 2 hours ago
              </p>
            </span>
          </nav>
        )}
        <div
          onClick={() => setShowEmoji(false)}
          style={{
            overflowY: 'auto',
            flex: 1,
            height:
              (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
              (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? '90vh'
                : '69vh', // Screen size monitor different height from laptop
            overflowX: 'hidden',
            backgroundColor: darkMode ? '#1A202C' : '#fff',
          }}
          id="chatDiv"
          ref={chatRef as any}
        >
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
                          left: 372,
                          top: 75,
                        }}
                      >
                        {message.author.id !== user.id ? (
                          <div className={feedStyles.border}>
                            <img
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 100,
                                left: 2.49999999999999999999,
                                top: 2,
                                position: 'relative',
                              }}
                              src={message.author.profile_picture}
                              alt=""
                            />
                          </div>
                        ) : null}
                      </div>

                      {message.author.id !== user.id ? (
                        <p
                          style={{
                            color: darkMode ? '#ebeef0' : '#000',
                            position: 'relative',
                            left: 445,
                            fontSize: 14,
                            fontFamily: 'Lato',
                          }}
                        >
                          {message.author.username} • 2 mins
                        </p>
                      ) : (
                        <p
                          style={{
                            color: darkMode ? '#ebeef0' : '#000',
                            position: 'relative',
                            fontFamily: 'Lato',
                            left: 1626,
                            top: 10,
                            fontSize: 14,
                          }}
                        >
                          You • Now
                        </p>
                      )}
                      <div
                        className={message.author.id === user.id ? feedStyles.yourmessage : feedStyles.message}
                        style={{ marginBottom: message.author.id !== user.id ? -40 : -4 }}
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
                        ) : message.body.includes('https://') ? (
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
                          <p style={{ marginLeft: 5, marginTop: 10, fontSize: 20 }} className={feedStyles.text}>
                            {message.body}
                          </p>
                        )}
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
                      left: 372,
                      top: 75,
                    }}
                  >
                    {message.author.id !== user.id ? (
                      <div className={feedStyles.border}>
                        <img
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 100,
                            left: 2.49999999999999999999,
                            top: 2,
                            position: 'relative',
                          }}
                          src={message.author.profile_picture}
                          alt=""
                        />
                      </div>
                    ) : null}
                  </div>

                  {message.author.id !== user.id ? (
                    <p
                      style={{
                        color: darkMode ? '#ebeef0' : '#000',
                        position: 'relative',
                        left: 445,
                        fontSize: 14,
                        fontFamily: 'Lato',
                      }}
                    >
                      {message.author.username} • 2 mins
                    </p>
                  ) : (
                    <p
                      style={{
                        color: darkMode ? '#ebeef0' : '#000',
                        position: 'relative',
                        fontFamily: 'Lato',
                        left: 1626,
                        top: 10,
                        fontSize: 14,
                      }}
                    >
                      You • Now
                    </p>
                  )}

                  <div
                    className={message.author.id === user.id ? feedStyles.yourmessage : feedStyles.message}
                    style={{ marginBottom: message.author.id !== user.id ? -40 : -4 }}
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
                    ) : message.body.includes('https://') ? (
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
                      <p style={{ marginLeft: 5, marginTop: 10, fontSize: 20 }} className={feedStyles.text}>
                        {message.body}
                      </p>
                    )}
                  </div>
                </>
              );
            })}
        </div>

        <div style={{ top: -10, right: 80, position: 'absolute' }}>
          <div className="outer-menu">
            <input className="checkbox-toggle" type="checkbox" />
            <div
              className="hamburger rainbow-box"
              style={{ borderRadius: 50, backgroundColor: darkMode ? '#1A202C' : '' }}
            >
              <div>
                <i className="fa fa-plus  fa-2x" style={{ color: darkMode ? '#fff' : '' }}></i>
              </div>
            </div>
            <div style={{ top: 36, right: 60, position: 'relative' }}>
              <Switch
                size="lg"
                onChange={async () => {
                  setDarkMode(!darkMode);
                  user && ToggleTheme({ variables: { authorid: user.id } });
                }}
                isChecked={darkMode}
              />
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
          style={{
            backgroundColor: darkMode ? '#1A202C' : '#fff',
            borderRightColor: darkMode ? '#fff' : '',
          }}
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
          style={{ backgroundColor: darkMode ? '#1A202C' : '#fff', borderRightColor: darkMode ? '#fff' : '' }}
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
        <div style={{ height: '20vh', backgroundColor: darkMode ? '#1A202C' : '#fff' }}></div>

        {groupSelected !== '' && user ? (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: darkMode ? '#1A202C' : '#fff',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'relative',
              }}
            >
              <InputGroup size="lg" style={{ width: '50%', top: -100, height: 60, left: 550 }}>
                <Input
                  placeholder="Type a message..."
                  style={{
                    color: darkMode ? '#fff' : '#000',
                    borderRadius: 100,
                    paddingRight: 100,
                  }}
                  value={messageVal}
                  _placeholder={{ color: darkMode ? '#fff' : '#7c7c82' }}
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
                          image: false,
                          messageid: generateId(24),
                        },
                      });
                      setMessageVal('');
                    }
                  }}
                  onChange={(e) => setMessageVal(e.currentTarget.value)}
                  onClick={() => showEmoji && setShowEmoji(false)}
                />
                <InputRightElement
                  style={{
                    backgroundColor: 'transparent',
                    right: 24,
                    cursor: 'pointer',
                  }}
                >
                  <InsertPhotoIcon
                    onClick={() => {
                      document.getElementById('filepicker')?.click();
                    }}
                    fontSize="large"
                    style={{
                      color: darkMode ? '#fff' : 'gray',
                    }}
                  />

                  <EmojiEmotionsIcon
                    onClick={() => setShowEmoji(!showEmoji)}
                    fontSize="large"
                    style={{
                      color: darkMode ? '#fff' : 'gray',
                    }}
                  />

                  <input
                    type="file"
                    id="filepicker"
                    accept="image/x-png,image/gif,image/jpeg"
                    onChange={(e: any) => {
                      const file = e.target.files[0];

                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        console.log(reader.result);
                        try {
                          await SendMessage({
                            variables: {
                              groupid: groupSelected,
                              body: reader.result,
                              author: {
                                username: user.username,
                                email: user.email,
                                id: user.id,
                                profile_picture: user.profile_picture,
                              },
                              image: true,
                              messageid: generateId(24),
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
                  style={{ position: 'absolute', bottom: 100 }}
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
