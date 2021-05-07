import client from '@/../apollo-client';
import { Theme } from '@/../context/theme';
import { GET_USER_ID } from '@/apollo/Queries';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';
import meStyles from '../styles/me.module.css';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useMutation } from '@apollo/client';
import { TOGGLE_THEME } from '@/apollo/Mutations';

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
      if (currentUser.dark_theme === 'true') {
        setDarkMode(true);
        (document.body.style as any) = 'background: #1A202C';
      }
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
      if (currentUser.dark_theme === 'true') {
        (document.body.style as any) = 'background: #1A202C';
      }
    }
  };
  const [ToggleTheme] = useMutation(TOGGLE_THEME);
  useEffect(() => {
    if (
      (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
      (typeof window !== 'undefined' && window.screen.availWidth) < 180
    ) {
      setLeft(460);
    }
    GetUser();
    console.log(user);
    if (user && user.dark_theme == 'true') {
      setDarkModeSelected(!darkModeSelected);
    } else {
      setLightModeSelected(!lightModeSelected);
    }
  }, [session]);
  return (
    <div
      className="site"
      style={{ position: 'relative', backgroundColor: user && user.dark_theme === 'true' ? '#1A202C' : '' }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src="https://source.unsplash.com/random"
          style={{
            maxWidth: '100%',
            width: 880,
            position: 'absolute',
            height: 255,
            left,
            objectFit: 'cover',
          }}
          alt=""
        />
      </div>
      <div className="profile-card" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="pc-user">
          <div className="pc-user-image">
            <img
              src="https://lh3.googleusercontent.com/ogw/ADGmqu8Ioh_ZvFt07Br1iOqhn39V9n0ndZ3Y2nrXiUtw=s83-c-mo"
              alt=""
              style={{
                width: 200,
                borderRadius: 100,
                marginLeft: '180%',
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
                top: 190,
                left:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 22
                    : '-6%',
                position: 'relative',
                fontFamily: 'Lato',
              }}
            >
              <p>Nikhil Rao</p>
            </h3>
            <h3
              style={{
                top: 190,
                left:
                  (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                  (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                    ? 22
                    : '-4%',
                position: 'relative',
                fontFamily: 'Lato',
                color: 'gray',
              }}
            >
              <p>nikhil23.rao@gmail.com</p>
            </h3>
          </div>
        </div>
      </div>
      <Accordion
        style={{
          width: 880,
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
