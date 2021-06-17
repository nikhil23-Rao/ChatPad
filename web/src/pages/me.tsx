import client from '@/../apollo-client';
import { Theme } from '@/../context/theme';
import { GET_USER_ID } from '@/apollo/Queries';
import { signOut, useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { SWITCH_ONLINE, TOGGLE_THEME, UPDATE_TIME } from '@/apollo/Mutations';
import { Spinner } from '@chakra-ui/react';
import feedStyles from '../styles/feed.module.css';
import meStyles from '../styles/me.module.css';
import Link from 'next/link';

interface MeProps {}

const Me: React.FC<MeProps> = ({}) => {
  const [session] = useSession();
  const [darkModeSelected, setDarkModeSelected] = useState(false);
  const [closed, setClosed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState<'appearence' | 'logout' | 'profile' | ''>('');
  const [lightModeSelected, setLightModeSelected] = useState(false);
  const [left, setLeft] = useState<string | number>('28.75rem');
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    dark_theme: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
  } | null>(null);
  const theme = useContext(Theme);
  const GetUser = async () => {
    if (session) {
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
      if (currentUser.dark_theme === 'true') {
        setDarkMode(true);
      }
      setUser(currentUser);
    }
  };
  const [ToggleTheme] = useMutation(TOGGLE_THEME);
  const [UpdateTime] = useMutation(UPDATE_TIME);
  const [SwitchOnline] = useMutation(SWITCH_ONLINE);
  useEffect(() => {
    GetUser();
    if (user && user.dark_theme == 'true') {
      setDarkModeSelected(!darkModeSelected);
    } else {
      setLightModeSelected(!lightModeSelected);
    }
  }, [session]);
  useEffect(() => {
    setInterval(() => {
      UpdateTime();
    }, 60000);
    if (user) {
      window.addEventListener('beforeunload', (ev) => {
        setClosed(true);
      });
      if (user.dark_theme === 'true') (document.body.style as any) = 'background-color: #0B0E11';
      if (closed === true) {
        SwitchOnline({ variables: { authorid: user?.id, value: false } });
      }
      SwitchOnline({ variables: { authorid: user?.id, value: true } });
    }
  }, [user, closed, session]);
  if (!user)
    return (
      <div className={feedStyles.centered}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );

  return (
    <>
      <div className="profile_container" style={{ backgroundColor: user.dark_theme === 'true' ? '#151A21' : '' }}>
        <header className={meStyles.header}></header>
        <main>
          <div className="row">
            <div className="left col-lg-4">
              <div className="photo-left">
                <img className="photo" src={user && (user.profile_picture as any)} />
              </div>
              <h4 className="name" style={{ color: user.dark_theme === 'true' ? '#fff' : '' }}>
                {user && user.username}
              </h4>
              <p className="info" style={{ color: user.dark_theme === 'true' ? '#fff' : '' }}>
                {user && user.email}
              </p>

              <p className="desc" style={{ color: user.dark_theme === 'true' ? '#fff' : '' }}>
                Here is where you can edit your bio.
              </p>
            </div>
            <div className="right col-lg-8">
              <ul className="nav">
                <li
                  onClick={() => (window.location.href = '/feed')}
                  style={{
                    textDecoration: tab === '' ? 'underline' : '',
                    color: user.dark_theme === 'true' ? '#fff' : '',
                  }}
                >
                  <i className="fa fa-home fa-2x"></i>
                </li>
                <li
                  onClick={() => setTab('profile')}
                  style={{
                    textDecoration: tab === '' ? 'underline' : '',
                    color: user.dark_theme === 'true' ? '#fff' : '',
                  }}
                >
                  <i className="fa fa-user-circle fa-2x"></i>
                </li>

                <li
                  onClick={() => setTab('appearence')}
                  style={{
                    textDecoration: tab === 'appearence' ? 'underline' : '',
                    color: user.dark_theme === 'true' ? '#fff' : '',
                  }}
                >
                  <i className="fa fa-eye fa-2x"></i>
                </li>
                <li
                  style={{ color: '#F56565', textDecoration: 'none' }}
                  onClick={async () => {
                    await SwitchOnline({ variables: { authorid: user.id, value: false } });
                    setTab('logout');
                    signOut({ callbackUrl: '/login' });
                  }}
                >
                  <i className="fa fa-sign-out fa-2x"></i>
                </li>
              </ul>
              {tab === 'appearence' && (
                <div style={{ display: 'inline' }}>
                  <img
                    alt=""
                    style={{
                      position: 'relative',
                      top: 30,
                      border: user.dark_theme === 'true' ? 'solid 5px dodgerblue' : '',
                      cursor: 'pointer',
                    }}
                    onClick={async () => {
                      if (user.dark_theme === 'true') return;
                      await ToggleTheme({ variables: { authorid: user?.id } });
                      window.location.reload(false);
                    }}
                    className="d-block border-bottom mb-2 width-full"
                    src="https://github.githubassets.com/images/modules/settings/color_modes/dark_preview.svg"
                  ></img>
                  <img
                    style={{
                      position: 'relative',
                      top: -97,
                      left: 300,
                      border: user.dark_theme === 'false' ? 'solid 5px dodgerblue' : '',
                      cursor: 'pointer',
                    }}
                    onClick={async () => {
                      if (user.dark_theme === 'false') return;
                      await ToggleTheme({ variables: { authorid: user?.id } });
                      window.location.reload(false);
                    }}
                    alt=""
                    className="d-block border-bottom mb-2 width-full"
                    src="https://github.githubassets.com/images/modules/settings/color_modes/light_preview.svg"
                  />
                  <p
                    style={{
                      top: -98,
                      position: 'relative',
                      left: 363,
                      fontFamily: 'Lato',
                      color: user.dark_theme === 'true' ? '#fff' : '',
                    }}
                  >
                    Luminous Light
                  </p>
                  <p
                    style={{
                      top: -120,
                      position: 'relative',
                      left: 63,
                      fontFamily: 'Lato',
                      color: user.dark_theme === 'true' ? '#fff' : '',
                    }}
                  >
                    Default Dark
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Me;
