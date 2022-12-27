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
import Image from 'next/image';
import BackspaceIcon from '@material-ui/icons/Backspace';
import {
  GET_CHAT_PATHS,
  GET_GROUPS,
  GET_GROUP_NAME,
  GET_INITIAL_MESSAGES,
  GET_MEMBERS,
  GET_NOT_READ,
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
import NoteSharpIcon from '@material-ui/icons/NoteSharp';
import ReactGiphySearchbox from 'react-giphy-searchbox';
import { formatAMPM } from '@/../utils/formatTime';
import { tw } from 'twind';
import { isUrl } from '@/../utils/isUrl';
import { AddMembers } from '@/components/AddMembers';
import { BURNING_SUN, DARK_NIGHT, LIGHT_RAINBOW, LINEAR_MAGIC, OCEAN_BLUE } from '../../constants/vars/messageColors';
import { Tooltip } from '@material-ui/core';
import Lightbox from 'react-awesome-lightbox';
import CryptoJS from 'crypto-js';
import { urlify } from '@/../utils/urlify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Loader } from '@/components/loader';
const CHATPAD_SECURE_KEY = 'ShFSES21qHsQEqZXMxQ9zgHy+bu0=';
export function encrypt(text = '', key = CHATPAD_SECURE_KEY) {
  const message = CryptoJS.AES.encrypt(text, key);
  return message.toString();
}
export function decrypt(message = '', key = CHATPAD_SECURE_KEY) {
  var code = CryptoJS.AES.decrypt(message, key);
  var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

  return decryptedMessage;
}

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
  const [pageLoading, setPageLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(10);
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [stickerGalleryShown, setStickerGalleryShown] = useState(false);
  const [previewShown, setPreviewShown] = useState(false);
  const [preview, setPreview] = useState('');
  const [groupNameValue, setGroupNameValue] = useState('');
  const [messageVal, setMessageVal] = useState('');
  const [session] = useSession();
  const chatRef = useRef<null | HTMLElement>();
  const [screenHeight, setScreenHeight] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [membersOfGroup, setMembersOfGroup] = useState([]);
  const [imgPreview, setImgPreview] = useState('');
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    dark_theme: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
    message_color:
      | 'Dark Night'
      | 'Linear Magic'
      | 'Light Rainbow'
      | 'Burning Sun'
      | 'Ocean Blue'
      | ''
      | undefined
      | null;
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
        message_color: 'Dark Night' | 'Linear Magic' | 'Light Rainbow' | 'Burning Sun' | 'Ocean Blue' | '' | null;
      } = {
        username: session.user.name!,
        email: session.user.email!,
        id: result.data.GetUserId[0],
        dark_theme: result.data.GetUserId[1],
        online: true,
        profile_picture: session.user.image!,
        message_color: result.data.GetUserId[4],
      };
      setDarkMode(currentUser.dark_theme === 'true' ? true : false);
      setUser(currentUser);
      SwitchOnline({ variables: { authorid: currentUser.id, value: true, groupid: groupSelected } });
      SetChatOn({ variables: { authorid: currentUser.id, groupid: groupSelected, currentGroupid: groupSelected } });

      window.addEventListener('beforeunload', function (e) {
        SwitchOnline({ variables: { authorid: currentUser.id, value: false, groupid: groupSelected } });
        SwitchOnline({ variables: { authorid: currentUser.id, value: false, groupid: groupSelected } });
        for (var i = 0; i < 100000000; i++) {}
        return undefined;
      });
    }
  };

  const toast = useToast();
  const { isOpen: imageModalIsOpen, onOpen: imageModalOnOpen, onClose: imageModalOnClose } = useDisclosure();
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
  const { data: GetMembers } = useSubscription(GET_USERS_TYPING);
  const { data: GroupNameData, loading: GroupNameLoading, refetch: groupNameRefetch } = useQuery(GET_GROUP_NAME, {
    variables: { groupid: groupSelected },
  });
  const { data: unreadData, loading: unreadLoading, refetch: unreadRefetch } = useQuery(GET_NOT_READ, {
    variables: {
      authorid: user?.id,
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
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);

      setPageLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (pageLoading && typeof window !== 'undefined') window.scrollTo(0, 0);
  }, [pageLoading, typeof window]);

  useEffect(() => {
    window.addEventListener('visibilitychange', () => {
      if (user) {
        if (document.hidden === true) {
          SetChatOn({
            variables: {
              authorid: user?.id,
              groupid: '',
              currentGroupid: groupSelected,
            },
          });
          SwitchOnline({ variables: { authorid: user?.id, value: false, groupid: groupSelected } });
        }
        if (document.hidden === false) {
          SetChatOn({
            variables: {
              authorid: user?.id,
              groupid: groupSelected,
              currentGroupid: groupSelected,
            },
          });
          SwitchOnline({ variables: { authorid: user?.id, value: true, groupid: groupSelected } });
        }
      }
    });
  }, [user, typeof window]);

  useEffect(() => {
    if (typeof GroupNameData !== 'undefined') {
      setGroupNameValue(GroupNameData.GetGroupName.name);
    }
  }, [typeof GroupNameData]);

  useEffect(() => {
    if (messageVal.length > 0 && user) {
      SetUserTyping({
        variables: {
          authorid: user.id,
          groupid: groupSelected,
          value: true,
        },
      });
    }
    if (messageVal.length <= 0 && user) {
      SetUserTyping({
        variables: {
          authorid: user.id,
          groupid: groupSelected,
          value: false,
        },
      });
    }
  }, [user, messageVal, messages, messageVal.length]);

  useEffect(() => {
    if (typeof GetMembers !== 'undefined') {
      if (GetMembers.GetUsersTyping[GetMembers.GetUsersTyping.length - 1].id === groupSelected) {
        setMembersOfGroup(GetMembers.GetUsersTyping);
      }
    }
  }, [GetMembers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (screen.width <= 1440 && messageVal.length <= 75) {
        setScreenHeight('90vh');
      } else if (screen.width > 1440 && messageVal.length <= 75) {
        setScreenHeight('70vh');
      } else if (screen.width <= 1440 && messageVal.length >= 75) {
        setScreenHeight('79vh');
      } else if (screen.width > 1440 && messageVal.length >= 75) {
        setScreenHeight('60vh');
      }
    }
  }, [typeof window, pageLoading, messageVal]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      SwitchOnline({ variables: { authorid: user.id, value: true, groupid: groupSelected } });
      SetChatOn({
        variables: {
          authorid: user.id,
          groupid: window.location.href.substr(window.location.href.lastIndexOf('/') + 1),
          currentGroupid: groupSelected,
        },
      });
    }
  }, [user, groupSelected, typeof window, messages, messageData, realtimeData]);

  useEffect(() => {
    const el = document.getElementById('chatDiv');
    searchDataRefetch();
  }, [messages, realtimeData, messageData, pageLoading]);

  useEffect(() => {
    if (typeof messageData !== 'undefined') {
      const init = decrypt(messageData.GetInitialMessages);
      const messages = [...JSON.parse(init)];
      setMessages(messages.reverse());
    }
  }, [typeof messageData, groupSelected]);

  useEffect(() => {
    if (GroupNameData && user) {
      const arr = GroupNameData.GetGroupName.members.filter((member) => member.id === user?.id);
      if (arr.length === 0) {
        window.location.href = '/feed';
      }
    }
  }, [GroupNameData]);

  useEffect(() => {
    const el = document.getElementById('chatDiv');
    const breakpoint = document.getElementById('breakpoint');
    if (breakpoint && el) {
      const topPos = breakpoint?.offsetTop - 310; // Height That Reaches Breakpoint
      el.scrollTop = topPos;
    }
    setTimeout(() => {
      if (el && !breakpoint && !pageLoading) {
        el.scrollTop = el.scrollHeight + 1000;
      }
    }, 100);
  }, []);

  useEffect(() => {
    const el = document.getElementById('chatDiv');
    const breakpoint = document.getElementById('breakpoint');
    if (breakpoint && el) {
      const topPos = breakpoint?.offsetTop - 310; // Height That Reaches Breakpoint
      el.scrollTop = topPos;
    }
    if (el && !breakpoint && !pageLoading) {
      el.scrollTop = el.scrollHeight + 1000;
    }
  }, [typeof document, typeof window, messageData, messages, realtimeData, pageLoading]);

  const updateReadBy = async () => {
    if (document.visibilityState === 'visible' && user && messages.length > 0) {
      for (const message of messages) {
        if (message.author.id !== user.id && !message.read_by.includes(user.id)) {
          console.log('adding readby');
          await AddReadBy({
            variables: {
              member: user.id,
              messageid: message.messageid,
            },
          });
        }
      }
      await searchDataRefetch({ authorid: user.id, query });
    }
  };

  useEffect(() => {
    const el = document.getElementById('chatDiv');
    setInterval(() => {
      if (el && !pageLoading && el.scrollTop <= 5) {
        if (loadMoreData && loadMoreData.LoadMore.length === 0) return;
        setLoader(true);
        document.getElementById('loadmore')?.click();
        el.scrollTop = 500;
        el.scrollTop = 500;
        el.scrollTop = 500;
        setLoader(false);
      }
    }, 100);
  }, [pageLoading, typeof window]);

  useEffect(() => {
    setGroupSelected(currId);
  }, []);

  useEffect(() => {
    updateReadBy();
  }, [messageData, realtimeData, messages, user]);

  useEffect(() => {
    GetUser();
  }, [session]);
  useEffect(() => {
    (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
    (typeof window !== 'undefined' && window.screen.availWidth) < 1800
      ? ((document.body.style as any) = 'overflow: hidden; zoom: 0.8;')
      : 'overflow: hidden; zoom: 1;';

    onClose();
    imageModalOnClose();
    addMembersModalOnClose();
    viewMembersModalOnClose();
    editGroupNameModalOnClose();

    if (user && user.dark_theme === 'true') {
      (document.body.style as any) = 'background: #0C0E12';
    }
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    if (realtimeData && messages.includes(realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1])) return;
    if (
      document.visibilityState === 'hidden' &&
      realtimeData &&
      realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].author.id !== user?.id &&
      !messages.includes(realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1])
    ) {
      SwitchOnline({ variables: { authorid: user?.id, value: false, groupid: groupSelected } });
      SetChatOn({
        variables: { authorid: user?.id, groupid: '', currentGroupid: groupSelected },
      });
      playSound();
    }

    if (realtimeData && messages[messages.length - 1].body === realtimeData.GetAllMessages[0].body) {
      console.log('SENT IS TRUE');
      const newMessages = messages.slice();
      for (const message in newMessages) {
        if (typeof newMessages[message].sent != 'undefined') newMessages[message].sent = true;
      }
      console.log(newMessages);
      setMessages(newMessages);
      console.log('SET');
    }

    if (
      (realtimeData &&
        realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].author.id !== user?.id &&
        realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].groupid === groupSelected) ||
      (realtimeData &&
        realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].alert &&
        realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1].body.includes('added'))
    ) {
      setMessages((oldMessages) => [
        ...oldMessages,
        realtimeData.GetAllMessages[realtimeData.GetAllMessages.length - 1],
      ]);
    }
  }, [session, messageData, realtimeData, user?.dark_theme, groupSelected]);

  var today: any = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var day = days[new Date().getDay()];

  today = mm + '/' + dd + '/' + yyyy;

  const reader = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
  };

  return (
    <>
      {imageModalIsOpen ? (
        <Lightbox
          image={imgPreview}
          title=""
          onClose={() => {
            (document.body.style as any) =
              (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
              (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? 'zoom: 0.8'
                : 'zoom: 1';
            imageModalOnClose();
          }}
        />
      ) : null}
      <audio className="audio-element" id="sound">
        <source src="/sound/chatpadsound.mp3"></source>
      </audio>
      <Head>
        <title>ChatPad</title>
        <link rel="icon" href="/images/chatpadlogo.png" />
      </Head>
      <div>
        {GroupNameData &&
          groupSelected !== '' &&
          groupSelected !== undefined &&
          groupSelected !== null &&
          !pageLoading && (
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
                    {GroupNameData.GetGroupName.image.length === 0 &&
                    GroupNameData.GetGroupName.members.length === 1 ? (
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
                        ? 'Chat last active ' +
                          Math.round((Date.now() - messages[messages.length - 1].time) / 60000) +
                          ' minute ago'
                        : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) > 0 &&
                          Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 60
                        ? 'Chat last active ' +
                          Math.round((Date.now() - messages[messages.length - 1].time) / 60000) +
                          ' minutes ago'
                        : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) >= 60 &&
                          Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 1440
                        ? `Chat last active ${
                            day === messages[messages.length - 1].date[2]
                              ? 'today'
                              : `on ${messages[messages.length - 1].date[2]}`
                          } at ` + messages[messages.length - 1].date[1]
                        : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) > 1440 &&
                          Math.round((Date.now() - messages[messages.length - 1].time) / 60000) < 10080
                        ? 'Chat last active on ' +
                          messages[messages.length - 1].date[2] +
                          ' at ' +
                          messages[messages.length - 1].date[1]
                        : Math.round((Date.now() - messages[messages.length - 1].time) / 60000) >= 10080
                        ? `Chat last active on ${messages[messages.length - 1].date[0]} at ${
                            messages[messages.length - 1].date[1]
                          }`
                        : ' Chat currently active'
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
            height: screenHeight,
            overflowX: 'hidden',
            backgroundColor: darkMode ? '#000' : '#fff',
            display: 'flex',
          }}
          id="chatDiv"
          ref={chatRef as any}
        >
          {loader ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              style={{ left: 1000, top: 45, position: 'relative' }}
            />
          ) : null}
          {pageLoading ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              className={feedStyles.centered}
              style={{ marginLeft: 150, marginTop: -25 }}
            />
          ) : null}
          {messages.length !== 0 && loadMoreData && !pageLoading && (
            <IconButton
              onClick={() => {
                const el = document.getElementById('chatDiv');
                if (loadMoreData && loadMoreData.LoadMore.length === 0) return;
                setLoader(true);
                setOffset(offset + 10);
                const dataLoadMore = [...loadMoreData.LoadMore];
                if (el) el.scrollTop = 500;
                setMessages([...dataLoadMore.reverse(), ...messages]);
                if (el) el.scrollTop = 500;
                if (el) el.scrollTop = 500;
                if (el) el.scrollTop = 500;
                setLoader(false);
                if (el) el.scrollTop = 500;
              }}
              style={{
                color: '#fff',
                position: 'relative',
                marginTop: 70,
                left: 1000,
                display: 'none',
              }}
              id="loadmore"
              className={feedStyles.loadmorebtn}
              children={<EjectIcon style={{ width: '4vh', height: '4vh' }} />}
            ></IconButton>
          )}

          {groupSelected !== '' &&
            messageData &&
            user &&
            !pageLoading &&
            unreadData &&
            messages.map((message, idx, arr) => {
              const prev = arr[idx - 1];
              const next = arr[idx + 1];
              return (
                <React.Fragment key={idx}>
                  {/* {console.log(JSON.parse(unreadData.GetNotRead[1]).messageid)} */}
                  {unreadData && unreadData.GetNotRead && !realtimeData ? (
                    parseInt(unreadData.GetNotRead[0]) > 0 &&
                    message.messageid === JSON.parse(unreadData.GetNotRead[1]).messageid ? (
                      <div
                        className="unreadcontainer"
                        style={{ top: 35, position: 'relative', marginTop: 50, marginBottom: 50 }}
                        id="breakpoint"
                      >
                        <div className="unreadline">&nbsp;</div>
                        <div className="unreadtext">
                          {parseInt(unreadData.GetNotRead[0]) > 1
                            ? parseInt(unreadData.GetNotRead[0]) + ' new messages'
                            : parseInt(unreadData.GetNotRead[0]) + ' new message'}
                        </div>
                        <div className="unreadline">&nbsp;</div>
                      </div>
                    ) : null
                  ) : null}
                  <div style={{ position: 'relative', top: 30 }}>
                    {!message.alert ? (
                      <div
                        style={{
                          position: 'relative',
                          left: 372,
                          top: 75,
                        }}
                      >
                        {(next && next.alert && next.author.id !== user.id) ||
                        (!next && message.author.id !== user.id && !message.alert) ||
                        (prev &&
                          next &&
                          message.author.id !== user.id &&
                          message.author.id === prev.author.id && // ENDS SEQUENCE
                          message.author.id !== next.author.id) ||
                        (prev &&
                          next &&
                          message.author.id !== user.id &&
                          message.author.id !== prev.author.id && // MIDDLE OF SEQUENCE
                          message.author.id !== next.author.id &&
                          !message.alert) ||
                        (!prev &&
                          next &&
                          message.author.id !== user.id &&
                          message.author.id !== next.author.id &&
                          !message.alert) ? (
                          <img
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 100,
                              left: 149,
                              top:
                                prev && prev.alert
                                  ? -74
                                  : !prev
                                  ? -43
                                  : prev &&
                                    next &&
                                    message.author.id !== user.id &&
                                    message.author.id !== prev.author.id && // MIDDLE OF SEQUENCE
                                    message.author.id !== next.author.id &&
                                    !message.alert
                                  ? -44
                                  : -73,
                              position: 'absolute',
                            }}
                            src={message.author.profile_picture}
                            alt=""
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {(prev &&
                      next &&
                      message.author.id !== user.id &&
                      !message.alert &&
                      !message.alert &&
                      !prev.alert &&
                      !next.alert &&
                      message.author.id !== prev.author.id) ||
                    (!prev &&
                      next &&
                      message.author.id !== user.id &&
                      !message.alert &&
                      !message.alert &&
                      !next.alert && // STARTS SEQUENACE
                      message.author.id === next.author.id) ||
                    (!prev &&
                      next &&
                      message.author.id !== user.id &&
                      message.author.id !== next.author.id &&
                      !message.alert) ? (
                      <p
                        style={{
                          color: darkMode ? '#ebeef0' : '#000',
                          position: 'relative',
                          left: 600,
                          top: 2,
                          fontSize: 14,
                          fontFamily: 'Lato',
                        }}
                      >
                        {message.author.username}
                      </p>
                    ) : null}

                    {message.author.id === user.id &&
                    !message.alert &&
                    typeof message.sent !== 'undefined' &&
                    message.sent === true ? (
                      <Tooltip arrow title="Message Sent." placement="right">
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            left: 1710,
                            top: 30,
                            borderRadius: 100,
                            position: 'absolute',
                            backgroundColor: '#0C65EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className="fa fa-check" style={{ color: '#fff', animation: 'checkmarkfade 1s' }}></i>
                        </div>
                      </Tooltip>
                    ) : message.author.id === user.id &&
                      !message.alert &&
                      typeof message.sent !== 'undefined' &&
                      message.sent === false ? (
                      <Tooltip arrow title="Message Sending..." placement="right">
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            left: 1710,
                            top: 30,
                            borderRadius: 100,
                            position: 'absolute',
                            backgroundColor: '#0C65EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Spinner size="xs" style={{ color: '#fff' }} />
                        </div>
                      </Tooltip>
                    ) : null}

                    <Tooltip
                      placement={message.author.id === user.id ? 'left' : 'right'}
                      title={
                        <h1 style={{ fontSize: 15 }}>
                          {' '}
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
                        </h1>
                      }
                      arrow
                    >
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
                          backgroundColor:
                            message.author.id !== user.id && message.image ? (darkMode ? '#000' : '#fff') : '',
                          left: message.author.id !== user.id && !message.image ? 583 : '',
                          backgroundImage:
                            user.id === message.author.id && !message.image && !message.alert
                              ? user.message_color === 'Ocean Blue'
                                ? OCEAN_BLUE
                                : user.message_color === 'Linear Magic'
                                ? LINEAR_MAGIC
                                : user.message_color === 'Light Rainbow'
                                ? LIGHT_RAINBOW
                                : user.message_color === 'Burning Sun'
                                ? BURNING_SUN
                                : DARK_NIGHT
                              : '',
                          marginBottom:
                            next && next.author.id !== message.author.id // ENDS SEQUENCE
                              ? 80
                              : -5,
                          marginLeft: !sidebarShown ? -100 : '',
                          color: message.author.id !== user.id && user.dark_theme === 'false' ? '' : '#fff',
                          borderRadius: !next
                            ? message.author.id === user.id
                              ? '50px 0px 50px 50px'
                              : '0px 50px 50px 50px'
                            : !prev
                            ? message.author.id === user.id
                              ? '50px 50px 0px 50px'
                              : '50px 50px 50px 0px'
                            : prev && next
                            ? (!message.alert &&
                                !prev.alert &&
                                !next.alert &&
                                message.author.id !== prev.author.id && // MIDDLE OF SEQUENCE
                                message.author.id !== next.author.id) ||
                              (next.alert && prev.alert)
                              ? message.author.id === user.id
                                ? '4em 4em 4em 4em'
                                : '4em 4em 4em 4em'
                              : !prev.alert &&
                                !next.alert &&
                                message.author.id === prev.author.id && // MIDDLE OF SEQUENCE
                                message.author.id === next.author.id
                              ? message.author.id === user.id
                                ? '2em 0em 0em 2em'
                                : '0em 2em 2em 0em'
                              : (!message.alert &&
                                  !prev.alert &&
                                  message.author.id === prev.author.id && // ENDS SEQUENCE
                                  message.author.id !== next.author.id) ||
                                next.alert ||
                                !next
                              ? message.author.id === user.id
                                ? '50px 0px 50px 50px'
                                : '0px 50px 50px 50px'
                              : (!message.alert &&
                                  !prev.alert &&
                                  !next.alert &&
                                  message.author.id !== prev.author.id) ||
                                (!prev && // STARTS SEQUENACE
                                  message.author.id === next.author.id) ||
                                (next && prev.alert && next.author.id === message.author.id) ||
                                !prev
                              ? message.author.id === user.id
                                ? '50px 50px 0px 50px'
                                : '50px 50px 50px 0px'
                              : ''
                            : '',
                        }}
                      >
                        {message.alert ? (
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
                        ) : message.image ? (
                          <div style={{ width: 506, backgroundImage: 'none' }}>
                            <LazyLoadImage
                              onClick={() => {
                                (document.body.style as any) =
                                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                                    ? 'zoom: 1'
                                    : 'zoom: 1';
                                setImgPreview(message.body);
                                imageModalOnOpen();
                              }}
                              style={{
                                marginLeft: 5,
                                cursor: 'pointer',
                                width: 506,

                                marginBottom:
                                  (next && next.image && message.image) || (prev && !prev.image && message.image)
                                    ? -13
                                    : -13,
                                fontSize: 20,
                                borderRadius: !next
                                  ? message.author.id === user.id
                                    ? '50px 0px 50px 50px'
                                    : '0px 50px 50px 50px'
                                  : !prev
                                  ? message.author.id === user.id
                                    ? '50px 50px 0px 50px'
                                    : '50px 50px 50px 0px'
                                  : prev && next
                                  ? (!message.alert &&
                                      !prev.alert &&
                                      !next.alert &&
                                      message.author.id !== prev.author.id && // MIDDLE OF SEQUENCE
                                      message.author.id !== next.author.id) ||
                                    (next.alert && prev.alert)
                                    ? message.author.id === user.id
                                      ? '4em 4em 4em 4em'
                                      : '4em 4em 4em 4em'
                                    : !prev.alert &&
                                      !next.alert &&
                                      message.author.id === prev.author.id && // MIDDLE OF SEQUENCE
                                      message.author.id === next.author.id
                                    ? message.author.id === user.id
                                      ? '2em 0em 0em 2em'
                                      : '0em 2em 2em 0em'
                                    : (!message.alert &&
                                        !prev.alert &&
                                        message.author.id === prev.author.id && // ENDS SEQUENCE
                                        message.author.id !== next.author.id) ||
                                      next.alert ||
                                      !next
                                    ? message.author.id === user.id
                                      ? '50px 0px 50px 50px'
                                      : '0px 50px 50px 50px'
                                    : (!message.alert &&
                                        !prev.alert &&
                                        !next.alert &&
                                        message.author.id !== prev.author.id) ||
                                      (!prev && // STARTS SEQUENACE
                                        message.author.id === next.author.id) ||
                                      (next && prev.alert && next.author.id === message.author.id) ||
                                      !prev
                                    ? message.author.id === user.id
                                      ? '50px 50px 0px 50px'
                                      : '50px 50px 50px 0px'
                                    : ''
                                  : '',
                              }}
                              src={message.body}
                              className={feedStyles.text}
                              effect="blur"
                            />
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
                    </Tooltip>
                  </div>
                </React.Fragment>
              );
            })}
        </div>

        {!pageLoading && (
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
        )}
        {!pageLoading && (
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
        )}

        {!pageLoading && (
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
        )}
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
                      try {
                        await KickMembers({ variables: { memberid: user?.id, groupid: groupSelected } });
                        await KickMembers({ variables: { memberid: user?.id, groupid: groupSelected } });
                        await KickMembers({ variables: { memberid: user?.id, groupid: groupSelected } });
                        await KickMembers({ variables: { memberid: user?.id, groupid: groupSelected } });
                      } catch (err) {
                        console.log(err);
                      }
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

            {searchLoading && (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
                style={{ left: 200, top: 200, position: 'relative' }}
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

                        window.addEventListener('beforeunload', (e) => {
                          e.preventDefault();
                          delete e['returnValue'];
                        });
                        window.history.pushState('', '', `/chat/${group.id}`);
                        window.location.reload(true);
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
                              {group.last_message.image
                                ? '(Sent An Image/Sticker)'
                                : group.last_message.body.includes('has left') && group.last_message.alert
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
                                : group.last_message.body.length <= 18
                                ? group.last_message.body
                                : `${group.last_message.body.substr(0, 12)}...`}
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
                      onClick={(e: any) => {
                        window.addEventListener('beforeunload', (e) => {
                          e.preventDefault();
                          delete e['returnValue'];
                        });
                        window.history.pushState('', '', `/chat/${group.id}`);
                        window.location.reload(true);
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
                            color: darkMode ? '#D9D9D9' : '#000',
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
                              group.image.length === 0 && group.members.length === 2
                                ? 64
                                : group.image.length === 0 && group.members.length === 1
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
                          {group.last_message.image
                            ? '(Sent An Image/Sticker)'
                            : group.last_message.body.includes('has left') && group.last_message.alert
                            ? '(Left The Group)'
                            : group.last_message.alert && group.last_message.body.includes('kicked')
                            ? '(Kicked Member From Group)'
                            : group.last_message.alert &&
                              !group.last_message.body.includes('kicked') &&
                              !group.last_message.body.includes('added')
                            ? '(Changed The Group Name)'
                            : group.last_message.body.includes('added') && group.last_message.alert
                            ? '(Added Member To Group)'
                            : group.last_message.body.length <= 15
                            ? group.last_message.body
                            : `${group.last_message.body.substr(0, 17)}...`}
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
            backgroundColor: darkMode ? '#0B0617' : '',
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
        {!pageLoading ? (
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
        ) : (
          <div
            style={{
              height: '100vh',
              backgroundColor: darkMode ? '#000' : '#fff',
              overflow: 'hidden',
            }}
          ></div>
        )}

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
                {GetMembers &&
                  !pageLoading &&
                  membersOfGroup.map(
                    (member: {
                      id: string;
                      profile_picture: string;
                      online: boolean;
                      chaton: string;
                      typing: boolean;
                    }) => {
                      if (member.id !== user.id && !previewShown) {
                        return (
                          <div style={{ bottom: messageVal.length <= 75 ? '' : 94, position: 'relative' }}>
                            <div>
                              <img
                                src={member.profile_picture}
                                style={{
                                  borderRadius: 100,
                                  width: 43,
                                  position: 'relative',
                                  bottom: screenHeight === '70vh' ? 76 : screenHeight === '60vh' ? 15 : 45,
                                  opacity: member.online && member.chaton === groupSelected ? 1 : 0.5,
                                }}
                                alt=""
                              />
                              {member.typing &&
                              member.chaton ===
                                window.location.href.substr(window.location.href.lastIndexOf('/') + 1) ? (
                                <div
                                  className="chat-bubble"
                                  style={{
                                    marginLeft: 46,
                                    top: screenHeight === '70vh' ? -114 : screenHeight === '60vh' ? -53 : -84,
                                    position: 'relative',
                                  }}
                                >
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
                    },
                  )}
                {previewShown && (
                  <div
                    style={{
                      backgroundColor: darkMode ? '#1c1c1c' : '#fafafa',
                      alignItems: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      width: '98%',
                      height: 300,
                      position: 'relative',
                      borderRadius: 10,
                      top: screenHeight === '70vh' ? -330 : -300,
                    }}
                  >
                    <i className="fa fa-close fa-2x close-icon" onClick={() => setPreviewShown(false)}></i>
                    <img
                      src={preview}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      draggable={false}
                      loading="eager"
                      onLoad={() => console.log('loading')}
                    />
                    <button
                      className="imgsendbtn"
                      onClick={async () => {
                        setMessages([
                          ...messages,
                          {
                            groupid: groupSelected,
                            body: preview,
                            author: {
                              username: user.username,
                              email: user.email,
                              id: user.id,
                              profile_picture: user.profile_picture,
                            },
                            image: true,
                            messageid: generateId(24),
                            date: today,
                            time: formatAMPM(new Date()),
                            day,
                            alert: false,
                          },
                        ]);
                        setPreviewShown(false);
                        setPreview('');
                        await SendMessage({
                          variables: {
                            groupid: groupSelected,
                            body: preview,
                            author: {
                              username: user.username,
                              email: user.email,
                              id: user.id,
                              profile_picture: user.profile_picture,
                            },
                            image: true,
                            messageid: generateId(24),
                            date: today,
                            time: formatAMPM(new Date()),
                            day,
                            alert: false,
                          },
                        });
                      }}
                    ></button>
                  </div>
                )}
                {!pageLoading && (
                  <div
                    contentEditable={true}
                    onInput={(e) => {
                      const el = document.getElementById('contenteditabletextarea');

                      if (el && el.innerHTML && el.innerHTML.match(/img/) && urlify(el.innerHTML) !== null) {
                        setPreviewShown(true);
                        setPreview(
                          urlify(el.innerHTML)[0] !== null
                            ? urlify(el.innerHTML)[0]![0]!
                            : urlify(el.innerHTML)[1]![1]!,
                        );
                        while (el.firstChild) {
                          el.removeChild(el.firstChild);
                        }
                      }
                      setMessageVal(e.currentTarget.textContent as string);
                    }}
                    id="contenteditabletextarea"
                    placeholder={previewShown ? 'Add Attachment...' : 'Send a message...'}
                    style={{
                      cursor: 'text',
                      color: darkMode ? '#fff' : '#000',
                      right: !sidebarShown ? 90 : '',
                      borderRadius: 12,
                      backgroundColor: darkMode ? '#202327' : '#F4F4F4',
                      height: messageVal.length <= 75 ? 50 : 140,
                      top: screenHeight === '70vh' ? -28 : '',
                      width: screenHeight === '70vh' ? 955 : '',
                      position: 'absolute',
                    }}
                    onKeyPress={async (e) => {
                      const el = document.getElementById('contenteditabletextarea');

                      if (e.shiftKey) {
                        return;
                      }
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (previewShown)
                          return toast({
                            title: 'Please send the image first.',
                            status: 'warning',
                            position: 'bottom-left',
                            isClosable: true,
                          });
                        if (el) {
                          while (el.firstChild) {
                            el.removeChild(el.firstChild);
                          }
                        }
                        if (!messageVal.replace(/\s/g, '').length) {
                          return e.preventDefault();
                        }
                        SetUserTyping({
                          variables: {
                            authorid: user.id,
                            groupid: groupSelected,
                            value: false,
                          },
                        });
                        SetUserTyping({
                          variables: {
                            authorid: user.id,
                            groupid: groupSelected,
                            value: false,
                          },
                        });
                        SetUserTyping({
                          variables: {
                            authorid: user.id,
                            groupid: groupSelected,
                            value: false,
                          },
                        });

                        setMessageVal('');
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
                            sent: false,
                          },
                        ]);
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
                        await unreadRefetch();
                        SetUserTyping({
                          variables: {
                            authorid: user.id,
                            groupid: groupSelected,
                            value: false,
                          },
                        });
                        SwitchOnline({ variables: { authorid: user?.id, value: true, groupid: groupSelected } });
                        SetChatOn({
                          variables: { authorid: user?.id, groupid: groupSelected, currentGroupid: groupSelected },
                        });

                        e.preventDefault();

                        await SwitchOnline({ variables: { authorid: user?.id, value: true, groupid: groupSelected } });
                        await SetChatOn({
                          variables: { authorid: user?.id, groupid: groupSelected, currentGroupid: groupSelected },
                        });
                      }
                    }}
                    onClick={() => showEmoji && setShowEmoji(false)}
                  />
                )}
                {!pageLoading && (
                  <InputRightElement
                    style={{
                      top: screenHeight === '70vh' ? -27 : 6,
                      backgroundColor: 'transparent',
                      right: !sidebarShown ? 115 : 45,
                      cursor: 'pointer',
                    }}
                  >
                    {visible && (
                      <>
                        <InsertPhotoIcon
                          onClick={() => {
                            document.getElementById('imagepicker')?.click();
                          }}
                          fontSize="large"
                          style={{
                            color: darkMode ? '#4097FF' : 'gray',
                          }}
                        />

                        <NoteSharpIcon
                          onClick={() => {
                            setStickerGalleryShown(!stickerGalleryShown);
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
                      id="imagepicker"
                      accept="image/x-png,image/gif,image/jpeg"
                      onChange={(e: any) => {
                        const file = e.target.files[0];
                        console.log(file);
                        reader(file).then((res) => {
                          setPreviewShown(true);
                          setPreview(res as string);
                        });
                      }}
                      style={{ display: 'none' }}
                    />
                  </InputRightElement>
                )}
              </InputGroup>
            </div>
            {stickerGalleryShown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 200,
                  left: 580,
                }}
              >
                <ReactGiphySearchbox
                  searchPlaceholder="Search For Stickers To Send..."
                  masonryConfig={[
                    { columns: 4, imageWidth: 110, gutter: 5 },
                    { mq: '300px', columns: 3, imageWidth: 320, gutter: 5 },
                  ]}
                  apiKey="dmQDJFagLAfpapf0BdtxYOTV6myzNbkT"
                  onSelect={async (item) => {
                    setMessages([
                      ...messages,
                      {
                        groupid: groupSelected,
                        body: item.images.preview_gif.url,
                        author: {
                          username: user?.username,
                          email: user?.email,
                          id: user?.id,
                          profile_picture: user?.profile_picture,
                        },
                        image: true,
                        messageid: generateId(24),
                        date: today,
                        time: formatAMPM(new Date()),
                        day,
                        alert: false,
                      },
                    ]);
                    await SendMessage({
                      variables: {
                        groupid: groupSelected,
                        body: item.images.preview_gif.url,
                        author: {
                          username: user?.username,
                          email: user?.email,
                          id: user?.id,
                          profile_picture: user?.profile_picture,
                        },
                        image: true,
                        messageid: generateId(24),
                        date: today,
                        time: formatAMPM(new Date()),
                        day,
                        alert: false,
                      },
                    });
                    setStickerGalleryShown(false);
                  }}
                />
              </div>
            )}
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
