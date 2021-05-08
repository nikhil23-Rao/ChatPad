import client from '@/../apollo-client';
import { Theme } from '@/../context/theme';
import { GET_USER_ID } from '@/apollo/Queries';
import { signOut, useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useMutation } from '@apollo/client';
import { TOGGLE_THEME, UPDATE_TIME } from '@/apollo/Mutations';
import LoadingBar from 'react-top-loading-bar';
import { Button } from '@chakra-ui/react';
import Link from 'next/link';

interface MeProps {}

const Me: React.FC<MeProps> = ({}) => {
  const [session] = useSession();
  const [darkModeSelected, setDarkModeSelected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
        (document.body.style as any) = 'background: #1A202C';
      }
      setUser(currentUser);
    }
  };
  const [ToggleTheme] = useMutation(TOGGLE_THEME);
  const [UpdateTime] = useMutation(UPDATE_TIME);
  useEffect(() => {
    if (
      (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
      (typeof window !== 'undefined' && window.screen.availWidth) < 180
    ) {
      setLeft(460);
    }
    GetUser();
    if (user && user.dark_theme == 'true') {
      setDarkModeSelected(!darkModeSelected);
    } else {
      setLightModeSelected(!lightModeSelected);
    }
    setInterval(() => {
      UpdateTime();
    }, 60000);
  }, [session]);
  if (!user) return <LoadingBar color="red" progress={100} loaderSpeed={2000} height={4} />;

  return (
    <div
      className="site"
      style={{ position: 'relative', backgroundColor: user && user.dark_theme === 'true' ? '#1A202C' : '' }}
    >
      <div>
        <Link href="/feed">
          <a>
            <i
              className="fa fa-paper-plane fa-4x"
              style={{
                color: user?.dark_theme === 'true' ? '#fff' : '',
                cursor: 'pointer',
                position: 'absolute',
                top: 28,
                left: 36,
              }}
            ></i>
          </a>
        </Link>
      </div>
      <div style={{ position: 'relative' }}>
        <img
          src="https://source.unsplash.com/random"
          style={{
            maxWidth: '100%',
            width: 980,
            position: 'absolute',
            height: 255,
            left:
              (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
              (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                ? '12.9%'
                : '22.8%',
            borderRadius: '8px 8px 0px 0px',
            objectFit: 'cover',
          }}
          alt=""
        />
      </div>
      <div className="profile-card" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="pc-user">
          <div className="pc-user-image">
            <img
              src={user && (user.profile_picture as any)}
              alt=""
              style={{
                position: 'relative',
                left: '166%',
                bottom: '20%',
                width: 200,
                borderRadius: 100,
                boxShadow: '0px 5px 50px 0px rgb(146, 0, 255), 0px 0px 0px 7px rgba(107, 74, 255, 0.5)',
              }}
            />
          </div>
          <div
            className="pc-user-info"
            style={{
              textAlign: 'center',
              right:
                (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                  ? '42.4%'
                  : '44.45%',
              position: 'absolute',
            }}
          >
            <h3
              style={{
                top: 160,
                left:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? '-70%'
                    : '-104%',
                position: 'relative',
                fontFamily: 'Lato',
                color: '#000',
              }}
            >
              <p>{user && user.username}</p>
            </h3>
            <div style={{ position: 'relative', top: 180, right: 80 }}>
              <Button
                onClick={() => {
                  signOut({ callbackUrl: '/login' });
                }}
                colorScheme="red"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Accordion
        style={{
          width: 980,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 5,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Appearence</AccordionSummary>
        <AccordionDetails>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (user && user.dark_theme === 'false') return;
              setLightModeSelected(true);
              setDarkModeSelected(false);
              ToggleTheme({
                variables: {
                  authorid: user && user.id,
                },
              });
              window.location.reload(false);
            }}
          >
            <img
              style={{
                marginLeft: 150,
                border: user?.dark_theme === 'false' ? '5px solid #0993f6' : '',
              }}
              alt=""
              className="d-block border-bottom mb-2 width-full"
              src="https://github.githubassets.com/images/modules/settings/color_modes/light_preview.svg"
            />
            <p style={{ marginLeft: 214, fontFamily: 'Lato' }}>Light Theme</p>
          </div>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (user && user.dark_theme === 'true') return;
              setDarkModeSelected(true);
              setLightModeSelected(false);
              ToggleTheme({
                variables: {
                  authorid: user && user.id,
                },
              });
              window.location.reload(false);
            }}
          >
            <img
              alt=""
              className="d-block border-bottom mb-2 width-full"
              style={{ marginLeft: 100, border: user?.dark_theme === 'true' ? '5px solid #0993f6' : '' }}
              src="https://github.githubassets.com/images/modules/settings/color_modes/dark_preview.svg"
            ></img>
            <p style={{ marginLeft: 170, fontFamily: 'Lato' }}>Dark Theme</p>
          </div>
        </AccordionDetails>
      </Accordion>
      <div
        style={{
          backgroundColor: user && user.dark_theme === 'true' ? '#1A202C' : '',
          height: '20vh',
          position: 'relative',
          width: '100%',
          top: 100,
        }}
      ></div>
    </div>
  );
};

export default Me;
