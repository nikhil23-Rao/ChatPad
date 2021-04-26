import React, { useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useSession } from 'next-auth/client';
import feedStyles from '../styles/feed.module.css';
import SendIcon from '@material-ui/icons/Send';
import client from '@/../apollo-client';
import { GET_GROUPS, GET_USER_ID } from '../apollo/Queries';
import { Search } from '../components/Search';
import { Button, Input } from '@chakra-ui/react';
import { CREATE_GROUP } from '@/apollo/Mutations';
import { generateId } from '@/utils/GenerateId';
import { MemberContext } from '@/../context/members';
import { useQuery } from '@apollo/client';
import { IconButton } from '@material-ui/core';

interface FeedProps {}

const Feed: React.FC<FeedProps> = ({}) => {
  const memberContext = useContext(MemberContext);
  const [groupSelected, setGroupSelected] = useState('');
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

  const { data, loading } = useQuery(GET_GROUPS, { variables: { authorid: user?.id } });

  useEffect(() => {
    GetUser();
    if (window.screen.availHeight < 863 || window.screen.availWidth < 1800) {
      document.body.style.zoom = '80%';
    }
    console.log(groupSelected);
  }, [session, groupSelected]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <div style={{ backgroundColor: '#FCFDFC' }}>
        {groupSelected !== '' ? (
          <>
            <div className={feedStyles.message}>
              <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.chattext}>
                Flight
              </p>
            </div>
            <div className={feedStyles.yourmessage}>
              <p style={{ marginLeft: 5, marginTop: 10 }} className={feedStyles.chattext}>
                Ok
              </p>
            </div>
          </>
        ) : (
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
          {data.GetGroups.length === 0 && <h1>CREATE ONE FATTY</h1>}
          {data.GetGroups.map((group) => {
            if (group.members.length === 2) {
              return (
                <div
                  className={feedStyles.sidebarcontent}
                  style={{
                    backgroundColor: groupSelected === group.id ? '#6588de' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => setGroupSelected(group.id)}
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
                      fontWeight: 'bold',
                      color: groupSelected === group.id ? '#fff' : '#000',
                      position: 'relative',
                      bottom: 60,
                      left: 65,
                    }}
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
                    backgroundColor: groupSelected === group.id ? '#6588de' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => setGroupSelected(group.id)}
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
                      fontWeight: 'bold',
                      color: groupSelected === group.id ? '#fff' : '#000',
                      position: 'relative',
                      bottom: 50,
                      left: 75,
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
                    backgroundColor: groupSelected === group.id ? '#6588de' : '#6588de1a',
                    boxShadow: groupSelected === group.id ? '0px 8px 40px rgba(0, 72, 251, 0.3)' : '',
                  }}
                  key={group.id}
                  onClick={() => setGroupSelected(group.id)}
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
                      fontWeight: 'bold',
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
        {groupSelected !== '' ? (
          <div style={{ textAlign: 'center' }}>
            <input className={feedStyles.inputfield} placeholder="Send a message..." />
            <IconButton color="primary" children={<SendIcon />} className={feedStyles.sendbutton} />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Feed;
