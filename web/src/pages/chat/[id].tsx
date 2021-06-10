import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/client';
import feedStyles from '../../styles/feed.module.css';
import client from '@/../apollo-client';
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Input,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import BackspaceIcon from '@material-ui/icons/Backspace';
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
import {
  ADD_READ_BY,
  CHANGE_GROUP_NAME,
  DELETE_CONVERSATION,
  KICK_MEMBERS,
  SEND_MESSAGE,
  SET_CHAT_ON,
  SET_USER_TYPING,
  SWITCH_ONLINE,
  TOGGLE_THEME,
} from '@/apollo/Mutations';
import { generateId } from '@/../utils/GenerateId';
import Head from 'next/head';
import { GET_ALL_MESSAGES, GET_USERS_TYPING } from '@/apollo/Subscriptions';
import { Picker } from 'emoji-mart';
import { useRouter } from 'next/dist/client/router';
import { InputGroup, InputRightElement, Skeleton, SkeletonCircle, useToast, Spinner, Textarea } from '@chakra-ui/react';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import { formatAMPM } from '@/../utils/formatTime';
import { tw } from 'twind';
import { isUrl } from '@/../utils/isUrl';
import { AddMembers } from '@/components/AddMembers';
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
  const [sidebarShown, setSidebarShown] = useState(true);
  const [loader, setLoader] = useState(false);
  const [messageLoader, setMessageLoader] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [limit, setLimit] = useState(9);
  const [offset, setOffset] = useState(10);
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [groupNameValue, setGroupNameValue] = useState('');
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
      SwitchOnline({ variables: { authorid: currentUser.id, value: true } });
      SetChatOn({ variables: { authorid: currentUser.id, value: groupSelected } });

      window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        SwitchOnline({ variables: { authorid: currentUser.id, value: false } });
        SetChatOn({ variables: { authorid: currentUser.id, value: '' } });
      });
    }
  };

  const toast = useToast();
  const {
    isOpen: editGroupNameModalIsOpen,
    onOpen: editGroupNameModalOnOpen,
    onClose: editGroupNameModalOnClose,
  } = useDisclosure();
  const {
    isOpen: viewMembersModalIsOpen,
    onOpen: viewMembersModalOnOpen,
    onClose: viewMembersModalOnClose,
  } = useDisclosure();
  const {
    isOpen: addMembersModalIsOpen,
    onOpen: addMembersModalOnOpen,
    onClose: addMembersModalOnClose,
  } = useDisclosure();
  const {
    isOpen: leaveGroupModalIsOpen,
    onOpen: leaveGroupModalOnOpen,
    onClose: leaveGroupModalOnClose,
  } = useDisclosure();
  const {
    isOpen: deleteConversationModalIsOpen,
    onOpen: deleteConversationModalOnOpen,
    onClose: deleteConversationModalOnClose,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

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
  const { data: typingData } = useSubscription(GET_USERS_TYPING);
  const { data: GroupNameData, loading: GroupNameLoading, refetch: groupNameRefetch } = useQuery(GET_GROUP_NAME, {
    variables: { groupid: groupSelected },
  });
  const { data: onlineData, loading: onlineLoading, refetch: onlineRefetch } = useQuery(GET_MEMBERS, {
    variables: {
      groupid: groupSelected,
    },
  });
  const [AddReadBy] = useMutation(ADD_READ_BY);
  const [SwitchOnline] = useMutation(SWITCH_ONLINE);
  const [SetChatOn] = useMutation(SET_CHAT_ON);
  const [SetUserTyping] = useMutation(SET_USER_TYPING);
  const [ChangeGroupName] = useMutation(CHANGE_GROUP_NAME);
  const [KickMembers] = useMutation(KICK_MEMBERS);
  const [DeleteConversation] = useMutation(DELETE_CONVERSATION);

  const playSound = () => {
    const audio = document.getElementById('sound');

    if (audio) {
      (audio as HTMLMediaElement).play();
    }
  };

  useEffect(() => {
    if (typeof GroupNameData !== 'undefined') {
      setGroupNameValue(GroupNameData.GetGroupName.name);
    }
  }, [typeof GroupNameData]);

  useEffect(() => {
    if (messageVal.replace(/\s/g, '').length && user) {
      SetUserTyping({
        variables: {
          authorid: user.id,
          groupid: groupSelected,
          value: true,
        },
      });
      onlineRefetch();
    }
    if (!messageVal.replace(/\s/g, '').length && user) {
      SetUserTyping({
        variables: {
          authorid: user.id,
          groupid: groupSelected,
          value: false,
        },
      });
      onlineRefetch();
    }
  }, [user, messageVal, messages]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      SwitchOnline({ variables: { authorid: user.id, value: true } });
      SetChatOn({
        variables: {
          authorid: user.id,
          groupid: window.location.href.substr(window.location.href.lastIndexOf('/') + 1),
        },
      });
    }
  }, [user, groupSelected, typeof window, messages, messageData, realtimeData]);

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
  }, [typeof messageData, groupSelected]);

  useEffect(() => {
    if (GroupNameData && user) {
      console.log('HERE');
      const arr = GroupNameData.GetGroupName.members.filter((member) => member.id === user?.id);
      console.log('ARR', arr);
      if (arr.length === 0) {
        window.location.href = '/feed';
      }
    }
  }, [GroupNameData]);

  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById('chatDiv');
      if (el) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
      }
    }, 800); // Load time
  }, []);

  const updateReadBy = async () => {
    if (
      user &&
      messages.length > 0 &&
      messages[messages.length - 1].author.id !== user.id &&
      messages[messages.length - 1].read_by.includes(user.id)
    )
      return console.log('NOT SENDING REQUEST');
    if (
      document.visibilityState === 'visible' &&
      user &&
      messages.length > 0 &&
      messages[messages.length - 1].author.id !== user.id
    ) {
      console.log('SENDING');
      await AddReadBy({
        variables: {
          member: user.id,
          messageid: messages[messages.length - 1].messageid,
        },
      });
      await searchDataRefetch({ authorid: user.id, query });
      console.log('SENT');
    }
  };

  useEffect(() => {
    setGroupSelected(currId);
  }, []);

  useEffect(() => {
    updateReadBy();
  }, [messageData, realtimeData, messages, user]);

  useEffect(() => {
    GetUser();
    (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
    (typeof window !== 'undefined' && window.screen.availWidth) < 1800
      ? ((document.body.style as any) = 'overflow: hidden; zoom: 0.8;')
      : 'overflow: hidden; zoom: 1;';

    onClose();
    addMembersModalOnClose();
    viewMembersModalOnClose();
    editGroupNameModalOnClose();

    if (user && user.dark_theme === 'true') {
      (document.body.style as any) = 'background: #0C0E12';
    }
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }

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

    setInterval(() => {
      if (document.visibilityState === 'hidden' && user) {
        SetChatOn({ variables: { groupid: '', authorid: user.id } });
        onlineRefetch({ groupid: groupSelected });
        groupNameRefetch();
      }
      if (document.visibilityState !== 'hidden' && user) {
        SetChatOn({ variables: { groupid: groupSelected, authorid: user.id } });
        onlineRefetch({ groupid: groupSelected });
        groupNameRefetch();
      }
    }, 5000);
  }, [session, messageData, realtimeData, user?.dark_theme, groupSelected]);

  var today: any = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var day = days[new Date().getDay()];

  today = mm + '/' + dd + '/' + yyyy;

  if (router.isFallback || loading)
    return (
      <div className={feedStyles.centered}>
        <Spinner thickness="4px" speed="0.95s" emptyColor="gray.200" color="blue.500" size="xl" />
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
            className="navbar navbar-light "
            style={{
              background: darkMode ? '#000' : '#fff',
              position: 'relative',
              height: 100,
              borderBottom: darkMode ? '1px solid #2F3336' : ' 1px solid #eeeeee',
            }}
          >
            <span
              className="navbar-brand mb-0 h1"
              style={{ marginLeft: GroupNameData.GetGroupName.members.length === 2 ? 640 : 550, display: 'inline' }}
            >
              {GroupNameData.GetGroupName.dm ? (
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
              ) : !GroupNameData.GetGroupName.dm ? (
                <>
                  {GroupNameData.GetGroupName.image.length === 0 && GroupNameData.GetGroupName.members.length === 1 ? (
                    <img
                      src={user?.profile_picture as any}
                      alt=""
                      style={{ width: 54, height: 54, borderRadius: 125, display: 'inline' }}
                    />
                  ) : null}
                  {GroupNameData.GetGroupName.image.length === 0 && GroupNameData.GetGroupName.members.length >= 2 ? (
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
                        style={{
                          position: 'relative',
                          top: 10,
                          right: 60,
                          width: 30,
                          height: 30,
                          display: GroupNameData.GetGroupName.members.length <= 2 ? 'none' : '',
                        }}
                      >
                        <p style={{ position: 'relative', left: 2, top: 2 }}>
                          +{GroupNameData.GetGroupName.members.length - 2}
                        </p>
                      </div>
                    </div>
                  ) : GroupNameData.GetGroupName.image.length > 0 ? (
                    <div style={{ display: 'inline', position: 'relative', left: 50 }}>
                      <img
                        src={GroupNameData.GetGroupName.image}
                        style={{
                          width: 71,
                          height: 71,
                          borderRadius: 100,
                          display: 'inline',
                          position: 'relative',
                          top: 0,
                          right: 5,
                        }}
                        alt=""
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
              {GroupNameData.GetGroupName.dm ? (
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
              {!GroupNameData.GetGroupName.dm && (
                <p
                  style={{
                    display: 'inline',
                    fontFamily: 'Lato',
                    fontWeight: 'bold',
                    fontSize: 28,
                    marginLeft:
                      !GroupNameData.GetGroupName.dm && GroupNameData.GetGroupName.members.length === 2
                        ? 70
                        : GroupNameData.GetGroupName.members.length === 1 &&
                          GroupNameData.GetGroupName.image.length === 0
                        ? 20
                        : GroupNameData.GetGroupName.members.length === 2
                        ? 10
                        : GroupNameData.GetGroupName.image.length > 0
                        ? 60
                        : '',
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
                    bottom:
                      !GroupNameData.GetGroupName.dm &&
                      GroupNameData.GetGroupName.members.length === 2 &&
                      GroupNameData.GetGroupName.image.length === 0
                        ? 2
                        : GroupNameData.GetGroupName.members.length === 1 &&
                          GroupNameData.GetGroupName.image.length === 0
                        ? 13
                        : GroupNameData.GetGroupName.members.length === 2 &&
                          GroupNameData.GetGroupName.image.length === 0
                        ? 15
                        : GroupNameData.GetGroupName.image.length > 0
                        ? 20
                        : 5,
                    marginLeft:
                      !GroupNameData.GetGroupName.dm && GroupNameData.GetGroupName.members.length === 2
                        ? 140
                        : GroupNameData.GetGroupName.image.length > 0
                        ? 137
                        : GroupNameData.GetGroupName.members.length === 1 &&
                          GroupNameData.GetGroupName.image.length === 0
                        ? 78
                        : GroupNameData.GetGroupName.members.length === 2
                        ? 66
                        : GroupNameData.GetGroupName.members.length > 2
                        ? 137
                        : 20,
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
                      : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) >= 60 &&
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
                ? messageVal.length <= 75
                  ? '90vh'
                  : '77vh'
                : messageVal.length <= 75
                ? '69vh'
                : '63vh', // Screen size monitor different height from laptop
            overflowX: 'hidden',
            backgroundColor: darkMode ? '#000' : '#fff',
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
                setMessages([...dataLoadMore.reverse(), ...messages]);
                setLoader(false);
              }}
              style={{
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 70,
              }}
              className={feedStyles.loadmorebtn}
              children={<EjectIcon style={{ width: '4vh', height: '4vh' }} />}
            ></IconButton>
          )}
          {loader && (
            <div style={{ backgroundColor: darkMode ? '#000' : '#fff' }}>
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
            messages.map((message, idx) => {
              return (
                <React.Fragment key={message.messageid}>
                  <div style={{ position: 'relative', top: 30 }}>
                    <div
                      style={{
                        position: 'relative',
                        left: 372,
                        top: 75,
                      }}
                    >
                      {message.author.id !== user.id && !message.alert ? (
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

                    {message.author.id !== user.id && !message.alert ? (
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
                      !message.alert &&
                      message.author.id === user.id && (
                        <p
                          style={{
                            color: darkMode ? '#ebeef0' : '#000',
                            position: 'relative',
                            fontFamily: 'Lato',
                            left:
                              Math.round((Date.now() - message.time) / 60000) > 0 &&
                              Math.round((Date.now() - message.time) / 60000) < 60
                                ? 1575
                                : Math.round((Date.now() - message.time) / 60000) >= 60 &&
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
                            : Math.round((Date.now() - message.time) / 60000) >= 60 &&
                              Math.round((Date.now() - message.time) / 60000) < 1440
                            ? message.date[1]
                            : Math.round((Date.now() - message.time) / 60000) > 1440 &&
                              Math.round((Date.now() - message.time) / 60000) < 10080
                            ? message.date[2] + ', ' + message.date[1]
                            : Math.round((Date.now() - message.time) / 60000) > 1440
                            ? message.date[1] + ' ' + message.date[0]
                            : ' Now'}
                        </p>
                      )
                    )}

                    <div
                      className={
                        !message.alert
                          ? message.author.id === user.id && user.dark_theme === 'true'
                            ? feedStyles.yourmessage
                            : message.author.id === user.id && user.dark_theme === 'false'
                            ? feedStyles.yourmessagelight
                            : message.author.id !== user.id && user.dark_theme === 'true'
                            ? feedStyles.message
                            : feedStyles.messagelight
                          : ''
                      }
                      style={{
                        marginBottom: message.author.id !== user.id ? -40 : -4,
                        marginLeft: !sidebarShown ? -100 : '',
                        color: message.author.id !== user.id && user.dark_theme === 'false' ? '' : '#fff',
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
                      ) : message.alert ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            marginLeft: 250,
                            marginBottom: 30,
                            marginTop: 70,
                            fontWeight: 500,
                            color: darkMode ? '#fff' : '#000',
                          }}
                          className={feedStyles.groupNameChangeText}
                        >
                          {message.body.includes('left the group') && message.alert
                            ? message.body
                            : !message.body.includes('kicked') && !message.body.includes('added')
                            ? message.author.id !== user.id
                              ? `${message.author.username} has changed the group name to ${message.body}`
                              : `You have changed the group name to ${message.body}`
                            : message.body.includes('kicked')
                            ? message.author.id !== user.id
                              ? `${message.author.username} has ${message.body}`
                              : `You have ${message.body}`
                            : message.author.id === user.id
                            ? `You have ${message.body}`
                            : `${message.author.username} has ${message.body}`}
                        </div>
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
            top: 20,
            right: 165,
          }}
        >
          <Menu>
            <MenuButton px={4} py={2} transition="all 0.2s" _focus={{ outline: 'none' }}>
              <i
                className="fa fa-cog fa-3x"
                ref={btnRef as any}
                style={{ color: darkMode ? '#4097FF' : '', cursor: 'pointer' }}
              ></i>
            </MenuButton>
            <MenuList
              style={{
                marginRight:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? -25
                    : 25,
                position: 'relative',
                bottom: 14,
              }}
            >
              <>
                {GroupNameData && GroupNameData.GetGroupName && !GroupNameData.GetGroupName.name.includes('DM:') ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        (document.body.style as any) = 'zoom: 1';
                        editGroupNameModalOnOpen();
                      }}
                    >
                      {' '}
                      <i className="fa fa-pencil" style={{ marginRight: 10 }}></i> Edit Group Name
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        (document.body.style as any) = 'zoom: 1';
                        viewMembersModalOnOpen();
                      }}
                    >
                      {' '}
                      <i className="fa fa-users" style={{ marginRight: 10 }}></i> View Members
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        (document.body.style as any) = 'zoom: 1';
                        addMembersModalOnOpen();
                      }}
                    >
                      {' '}
                      <i className="fa fa-user-plus" style={{ marginRight: 10 }}></i> Add Members
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        (document.body.style as any) = 'zoom: 1';
                        leaveGroupModalOnOpen();
                      }}
                    >
                      {' '}
                      <i className="fa fa-sign-out" style={{ marginRight: 10, marginTop: 2 }}></i> Leave Group
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem
                    onClick={() => {
                      (document.body.style as any) = 'zoom: 1';
                      deleteConversationModalOnOpen();
                    }}
                  >
                    {' '}
                    <i className="fa fa-trash" style={{ marginRight: 10, marginTop: 0 }}></i> Delete Conversation
                  </MenuItem>
                )}
              </>
            </MenuList>
          </Menu>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 28,
            right: 120,
          }}
        >
          <i
            className="fa fa-info-circle fa-3x"
            ref={btnRef as any}
            onClick={() => {
              (document.body.style as any) = 'zoom: 1';
              onOpen();
            }}
            style={{ color: darkMode ? '#4097FF' : '', cursor: 'pointer' }}
          ></i>
        </div>

        <div
          style={{
            position: 'absolute',
            top: -3,
            right: 100,
          }}
        >
          <div className="outer-menu">
            <input className="checkbox-toggle" type="checkbox" onChange={() => setVisible(!visible)} />
            <div className="hamburger rainbow-box" style={{ borderRadius: 50, backgroundColor: 'transparent' }}>
              <div>
                <i
                  className={`fa fa-${visible ? 'user-plus' : 'plus'} fa-3x`}
                  style={{ color: darkMode ? '#4097FF' : '' }}
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
        {sidebarShown ? (
          <div
            className={feedStyles.leftsidebar}
            style={{
              backgroundColor: darkMode ? '#0A0514' : '',
              borderRightColor: darkMode ? '#2F3336' : '',
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

            <div
              className="search-box"
              style={{ backgroundColor: !darkMode ? '#F4F4F4' : '#202327', top: 86, outline: 'none' }}
            >
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
            <Modal
              onClose={() => {
                (document.body.style as any) =
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 'zoom: 0.8'
                    : 'zoom: 1';
                editGroupNameModalOnClose();
              }}
              isOpen={editGroupNameModalIsOpen}
              isCentered
            >
              <ModalOverlay />
              <ModalContent style={{ backgroundColor: darkMode ? '#2D3748' : '#E2E8F0' }}>
                <ModalHeader style={{ color: darkMode ? '#fff' : '#000' }}>Edit Group Name</ModalHeader>
                <ModalCloseButton style={{ color: '#F56565' }} />
                <ModalBody style={{ color: darkMode ? '#fff' : '#000' }}>
                  <Input value={groupNameValue} onChange={(e) => setGroupNameValue(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                  <Button
                    disabled={
                      !groupNameValue.trim() || groupNameValue === GroupNameData.GetGroupName.name ? true : false
                    }
                    onClick={async () => {
                      ChangeGroupName({ variables: { groupid: groupSelected, value: groupNameValue } });
                      await searchDataRefetch();
                      await groupNameRefetch();
                      setMessages([
                        ...messages,
                        {
                          groupid: groupSelected,
                          body: groupNameValue,
                          author: {
                            username: user?.username,
                            email: user?.email,
                            id: user?.id,
                            profile_picture: user?.profile_picture,
                          },
                          image: false,
                          messageid: generateId(24),
                          date: today,
                          time: Date.now(),
                          day,
                          alert: true,
                        },
                      ]);
                      await SendMessage({
                        variables: {
                          groupid: groupSelected,
                          body: ` ${groupNameValue}`,
                          author: {
                            username: user?.username,
                            email: user?.email,
                            id: user?.id,
                            profile_picture: user?.profile_picture,
                          },
                          image: false,
                          messageid: generateId(24),
                          time: formatAMPM(new Date()),
                          date: today,
                          day,
                          alert: true,
                        },
                      });
                      editGroupNameModalOnClose();
                      if (
                        (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                        (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                      ) {
                        (document.body.style as any) = 'zoom: 0.8';
                      } else {
                        (document.body.style as any) = 'zoom: 1';
                      }
                    }}
                    colorScheme="messenger"
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Modal
              onClose={() => {
                (document.body.style as any) =
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 'zoom: 0.8'
                    : 'zoom: 1';
                deleteConversationModalOnClose();
              }}
              isOpen={deleteConversationModalIsOpen}
              isCentered
            >
              <ModalOverlay />
              <ModalContent style={{ backgroundColor: darkMode ? '#2D3748' : '#E2E8F0' }}>
                <ModalHeader style={{ color: darkMode ? '#fff' : '#000' }}>
                  Are You Sure You Want To Delete This Conversation
                </ModalHeader>
                <ModalCloseButton style={{ color: '#F56565' }} />
                <ModalBody style={{ color: darkMode ? '#fff' : '#000' }}>
                  If you delete this conversation you will NOT be able to access it again.
                </ModalBody>
                <ModalFooter>
                  <Button mr={3} colorScheme="messenger" onClick={() => deleteConversationModalOnClose()}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={async () => {
                      await DeleteConversation({ variables: { groupid: groupSelected } });
                      window.location.href = '/feed';
                    }}
                  >
                    Delete Conversation
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Modal
              onClose={() => {
                (document.body.style as any) =
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 'zoom: 0.8'
                    : 'zoom: 1';
                leaveGroupModalOnClose();
              }}
              isOpen={leaveGroupModalIsOpen}
              isCentered
            >
              <ModalOverlay />
              <ModalContent style={{ backgroundColor: darkMode ? '#2D3748' : '#E2E8F0' }}>
                <ModalHeader style={{ color: darkMode ? '#fff' : '#000' }}>Are You Sure You Want To Leave?</ModalHeader>
                <ModalCloseButton style={{ color: '#F56565' }} />
                <ModalBody style={{ color: darkMode ? '#fff' : '#000' }}>
                  <p>
                    If you leave this group you will NOT be able to come back unless someone from this group invites
                    you.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="twitter" mr={3} onClick={() => leaveGroupModalOnClose()}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={async () => {
                      await KickMembers({ variables: { memberid: user?.id, groupid: groupSelected } });
                      await SendMessage({
                        variables: {
                          groupid: groupSelected,
                          body: `${user?.username} has left the group`,
                          author: {
                            username: user?.username,
                            email: user?.email,
                            id: user?.id,
                            profile_picture: user?.profile_picture,
                          },
                          image: false,
                          messageid: generateId(24),
                          time: formatAMPM(new Date()),
                          date: today,
                          day,
                          alert: true,
                        },
                      });
                      window.location.href = '/feed';
                    }}
                  >
                    Leave Group
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Modal
              onClose={() => {
                (document.body.style as any) =
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 'zoom: 0.8'
                    : 'zoom: 1';
                addMembersModalOnClose();
              }}
              isOpen={addMembersModalIsOpen}
              isCentered
            >
              <ModalOverlay />
              <ModalContent style={{ backgroundColor: darkMode ? '#2D3748' : '#E2E8F0' }}>
                <ModalHeader style={{ color: darkMode ? '#fff' : '#000' }}>
                  Add Members To {GroupNameData && GroupNameData.GetGroupName && GroupNameData.GetGroupName.name}
                </ModalHeader>
                <ModalCloseButton style={{ color: '#F56565' }} />
                <ModalBody style={{ color: darkMode ? '#fff' : '#000' }}>
                  <AddMembers />
                </ModalBody>
              </ModalContent>
            </Modal>
            <Modal
              size="3xl"
              onClose={() => {
                (document.body.style as any) =
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 'zoom: 0.8'
                    : 'zoom: 1';
                viewMembersModalOnClose();
              }}
              isOpen={viewMembersModalIsOpen}
              isCentered
            >
              <ModalOverlay />
              <ModalContent style={{ backgroundColor: darkMode ? '#2D3748' : '#E2E8F0' }}>
                <ModalHeader style={{ color: darkMode ? '#fff' : '#000' }}>
                  {GroupNameData && GroupNameData.GetGroupName ? `Members Of ${GroupNameData.GetGroupName.name}` : ''}
                </ModalHeader>
                <ModalCloseButton style={{ color: '#F56565' }} />
                <ModalBody style={{ color: darkMode ? '#fff' : '#000' }}>
                  <List>
                    {GroupNameData &&
                      GroupNameData.GetGroupName &&
                      GroupNameData.GetGroupName.members.map((member) => {
                        return (
                          <>
                            <ListItem key={member.id} button>
                              <ListItemAvatar>
                                <Avatar alt={member.username} src={member.profile_picture} />
                              </ListItemAvatar>
                              <ListItemText id={member.id} primary={member.id !== user?.id ? member.email : 'You'} />
                              {member.id !== user?.id && (
                                <ListItemSecondaryAction>
                                  <IconButton
                                    color="secondary"
                                    edge="end"
                                    children={<BackspaceIcon />}
                                    onClick={async () => {
                                      await KickMembers({ variables: { memberid: member.id, groupid: groupSelected } });

                                      await groupNameRefetch();
                                      await searchDataRefetch();
                                      setMessages([
                                        ...messages,
                                        {
                                          groupid: groupSelected,
                                          body: `kicked ${member.username}`,
                                          author: {
                                            username: user?.username,
                                            email: user?.email,
                                            id: user?.id,
                                            profile_picture: user?.profile_picture,
                                          },
                                          image: false,
                                          messageid: generateId(24),
                                          date: today,
                                          time: Date.now(),
                                          day,
                                          alert: true,
                                        },
                                      ]);
                                      await SendMessage({
                                        variables: {
                                          groupid: groupSelected,
                                          body: `kicked ${member.username}`,
                                          author: {
                                            username: user?.username,
                                            email: user?.email,
                                            id: user?.id,
                                            profile_picture: user?.profile_picture,
                                          },
                                          image: false,
                                          messageid: generateId(24),
                                          time: formatAMPM(new Date()),
                                          date: today,
                                          day,
                                          alert: true,
                                        },
                                      });
                                      await groupNameRefetch();
                                      await searchDataRefetch();
                                    }}
                                  />
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          </>
                        );
                      })}
                  </List>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="messenger"
                    onClick={() => {
                      viewMembersModalOnClose();
                      addMembersModalOnOpen();
                    }}
                  >
                    +
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            {GroupNameData && GroupNameData.GetGroupName ? (
              <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={() => {
                  (document.body.style as any) =
                    (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                    (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                      ? 'zoom: 0.8'
                      : 'zoom: 1';
                  onClose();
                }}
                finalFocusRef={btnRef as any}
              >
                <DrawerOverlay />
                <DrawerContent style={{ backgroundColor: darkMode ? '#303640' : '' }}>
                  <DrawerCloseButton style={{ color: '#F56565' }} />
                  <DrawerHeader style={{ color: darkMode ? '#fff' : '#000' }}>
                    {GroupNameData && GroupNameData.GetGroupName && GroupNameData.GetGroupName.members.length > 2
                      ? GroupNameData.GetGroupName.name
                      : 'DM (Direct Message)'}
                  </DrawerHeader>

                  <DrawerBody>
                    {GroupNameData && GroupNameData.GetGroupName && GroupNameData.GetGroupName.members.length === 2 ? (
                      GroupNameData.GetGroupName.members[0].id === user?.id ? (
                        <>
                          <img
                            src={GroupNameData.GetGroupName.members[1].profile_picture}
                            style={{ borderRadius: 100, left: 100, position: 'relative' }}
                            alt=""
                          />
                          <p
                            style={{
                              fontSize: 24,
                              marginRight: 35,
                              marginTop: 15,
                              marginLeft: 92,
                              color: darkMode ? '#fff' : '#000',
                            }}
                            className={tw('text-3xl font-bold')}
                          >
                            {typeof GroupNameData !== 'undefined' && GroupNameData.GetGroupName.members[1].username}
                          </p>
                        </>
                      ) : (
                        <>
                          <img
                            style={{ borderRadius: 100, left: 100, position: 'relative' }}
                            src={
                              typeof GroupNameData !== 'undefined' &&
                              GroupNameData.GetGroupName.members[0].profile_picture
                            }
                            alt=""
                          />
                          <p
                            style={{
                              fontSize: 24,
                              marginRight: 35,
                              marginTop: 15,
                              marginLeft: 92,
                              color: darkMode ? '#fff' : '#000',
                            }}
                            className={tw('text-3xl font-bold')}
                          >
                            {typeof GroupNameData !== 'undefined' && GroupNameData.GetGroupName.members[0].username}
                          </p>
                        </>
                      )
                    ) : typeof GroupNameData !== 'undefined' && GroupNameData.GetGroupName.members.length > 2 ? (
                      <>
                        {typeof GroupNameData !== 'undefined' && GroupNameData.GetGroupName.image.length > 0 ? (
                          <>
                            <img
                              style={{ borderRadius: 100, left: 100, position: 'relative', width: 100, height: 100 }}
                              src={GroupNameData.GetGroupName.image}
                              alt=""
                            />

                            {GroupNameData.GetGroupName.members.map((member) => {
                              return (
                                <p
                                  style={{
                                    fontSize: 24,
                                    marginRight: 35,
                                    marginLeft: 120,
                                    color: darkMode ? '#fff' : '#000',
                                    position: 'relative',
                                    top: 20,
                                  }}
                                  className={tw('text-3xl font-bold')}
                                >
                                  {member.username !== user?.username
                                    ? member.username.substr(0, member.username.indexOf(' '))
                                    : 'You'}
                                </p>
                              );
                            })}
                          </>
                        ) : (
                          <>
                            <img
                              style={{ borderRadius: 100, left: 100, position: 'relative', width: 50, top: 30 }}
                              src={GroupNameData.GetGroupName.members[0].profile_picture}
                              alt=""
                            />
                            <img
                              style={{
                                borderRadius: 100,
                                left: 140,
                                bottom: 20,
                                position: 'relative',
                                width: 50,
                              }}
                              src={GroupNameData.GetGroupName.members[1].profile_picture}
                              alt=""
                            />
                            <div
                              style={{
                                borderRadius: 200,
                                left: 90,
                                marginBottom: 200,
                                position: 'relative',
                                width: 50,
                                height: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              className={feedStyles.dot}
                            >
                              <p style={{ fontSize: 22, position: 'relative', left: 10, top: 8 }}>
                                +{GroupNameData.GetGroupName.members.length - 2}
                              </p>
                            </div>
                            {GroupNameData.GetGroupName.members.map((member) => {
                              return (
                                <p
                                  style={{
                                    fontSize: 24,
                                    marginRight: 35,
                                    marginLeft: 120,
                                    color: darkMode ? '#fff' : '#000',
                                    position: 'relative',
                                    bottom: 200,
                                  }}
                                  className={tw('text-3xl font-bold')}
                                >
                                  {member.username !== user?.username ? member.username : 'You'}
                                </p>
                              );
                            })}
                          </>
                        )}
                      </>
                    ) : null}
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            ) : null}

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
                              group.last_message.author.id !== user.id &&
                              document.visibilityState === 'hidden' &&
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
        ) : null}

        <div
          className={feedStyles.profile}
          style={{
            backgroundColor: darkMode ? '#0A0514' : '',
            borderRightColor: darkMode ? '#2F3336' : '',
            borderBottomColor: !darkMode ? '#eeeeee' : '#2F3336',
            display: !sidebarShown ? 'none' : '',
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
                top: 11.4,
                marginLeft: '5.17%',
                position: 'absolute',
                zIndex: -1,
                WebkitBorderRadius: 35,
              }}
            />
          </div>
        </div>
        <div
          style={{
            height:
              messageVal.length <= 75
                ? '20vh'
                : (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? '32.9vh'
                : '25vh',
            backgroundColor: darkMode ? '#000' : '#fff',
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
                        <div style={{ bottom: messageVal.length <= 75 ? '' : 94, position: 'relative' }}>
                          <div>
                            <img
                              src={member.profile_picture}
                              style={{
                                borderRadius: 100,
                                width: 43,
                                position: 'relative',
                                bottom: 45,
                                opacity: member.online && member.chaton === groupSelected ? 1 : 0.5,
                              }}
                              alt=""
                            />
                            {member.typing &&
                            member.chaton === window.location.href.substr(window.location.href.lastIndexOf('/') + 1) ? (
                              <div className="chat-bubble" style={{ marginLeft: 46, top: -84, position: 'relative' }}>
                                <div className="typing">
                                  <div className="dot"></div>
                                  <div className="dot"></div>
                                  <div className="dot"></div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'row' }}></div>
                        </div>
                      );
                    }
                  })}

                <Textarea
                  placeholder="Send a message..."
                  style={{
                    color: darkMode ? '#fff' : '#000',
                    right: !sidebarShown ? 90 : '',
                    paddingRight: 100,
                    borderRadius: 10,
                    backgroundColor: darkMode ? '#202327' : '#F4F4F4',
                    minHeight: messageVal.length <= 75 ? 10 : 140,
                    bottom: 10,
                    lineHeight: 1.8,
                    position: 'absolute',
                  }}
                  resize="none"
                  value={messageVal}
                  _placeholder={{ color: darkMode ? '#fff' : '#7c7c82' }}
                  onKeyPress={async (e) => {
                    if (e.shiftKey) {
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
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
                          alert: false,
                        },
                      ]);
                      if (!messageVal.replace(/\s/g, '').length) {
                        await SetUserTyping({
                          variables: {
                            authorid: user.id,
                            groupid: groupSelected,
                            value: false,
                          },
                        });
                        return e.preventDefault();
                      }
                      setMessageVal('');
                      await SetUserTyping({
                        variables: {
                          authorid: user.id,
                          groupid: groupSelected,
                          value: false,
                        },
                      });
                      await SetUserTyping({
                        variables: {
                          authorid: user.id,
                          groupid: groupSelected,
                          value: false,
                        },
                      });

                      const el = document.getElementById('chatDiv');

                      if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
                      e.preventDefault();

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
                          alert: false,
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
                    top: 2,
                    backgroundColor: 'transparent',
                    right: !sidebarShown ? 115 : 24,
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
                        }}
                      />

                      <EmojiEmotionsIcon
                        onClick={() => setShowEmoji(!showEmoji)}
                        fontSize="large"
                        style={{
                          color: darkMode ? '#4097FF' : 'gray',
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
                              image: true,
                              messageid: generateId(24),
                              time: formatAMPM(new Date()),
                              date: today,
                              day,
                              alert: false,
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
                  emojiSize={50}
                  style={{
                    position: 'absolute',
                    bottom: 200,
                    left: 750,
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
