import React, { useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../styles/feed.module.css';
import SendIcon from '@material-ui/icons/Send';
import client from '@/../apollo-client';
import { GET_USER_ID } from '../apollo/Queries';
import { Search } from '../components/Search';
import { Button, Input } from '@chakra-ui/react';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import { MemberContext } from '@/../context/members';

interface FeedProps {}

const Feed: React.FC<FeedProps> = ({}) => {
  const memberContext = useContext(MemberContext);
  const [session] = useSession();
  const [user, setUser] = useState<{
    username: string | null | undefined;
    email: string | null | undefined;
    id: string | null | undefined;
    profile_picture: string | null | undefined;
    iat?: string | null | undefined;
  } | null>(null);

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
      window.onbeforeunload = () => {
        localStorage.removeItem('token');
      };
    }
  };

  useEffect(() => {
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    console.log('CONTEXT', memberContext);
  }, [session]);

  return (
    <>
      <div className={feedStyles.container}>
        <div className={feedStyles.bottomtab}></div>
        <div className={feedStyles.message}>
          <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.chattext}>
            HAHAHAHAHAHA O MY GOD HAHAHAHAHAHH
          </p>
        </div>
        <div className={feedStyles.yourmessage}>
          <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.chattext}>
            Whats So Funny?
          </p>
        </div>
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
          <div className={feedStyles.sidebarcontentselected}>
            <img
              src={user && (user.profile_picture! as string | any)}
              alt=""
              style={{ width: 50, height: 50, borderRadius: 25, marginTop: '3%', marginLeft: '3%' }}
            />
            <p style={{ fontWeight: 'bold', color: '#fff', position: 'relative', bottom: 45, left: 65 }}>
              {user && user.username}
            </p>
          </div>
          <div className={feedStyles.sidebarcontent}>
            <img
              src={'https://lh3.googleusercontent.com/a-/AOh14Gg_hGyTjOBnqy-_fKKk5yjlUNDgjw6z2bOylHI0=s48-c-k-no'}
              alt=""
              style={{ width: 50, height: 50, borderRadius: 25, marginTop: '3%', marginLeft: '3%' }}
            />
            <p style={{ fontWeight: 'bold', color: '#000', position: 'relative', bottom: 45, left: 65 }}>Vinay Rao</p>
          </div>
        </div>
        <div className={feedStyles.profile}>
          <img
            src={user! && (user.profile_picture as string | undefined)}
            alt=""
            style={{ width: 70, height: 70, borderRadius: 35, marginTop: '3%', marginLeft: '3%' }}
          />
          <p style={{ fontWeight: 'bold', color: '#000', position: 'relative', bottom: 55, left: 89 }}>
            {user && user.username}
          </p>{' '}
          <p style={{ fontWeight: 'bold', color: '#6E6969', position: 'relative', bottom: 55, left: 89 }}>
            {user && user.email}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <input className={feedStyles.inputfield} placeholder="Send a message..." />
        </div>
        <button className={feedStyles.sendbutton}>
          Send <SendIcon fontSize="small" />
        </button>
      </div>
    </>
  );
};

export default Feed;
