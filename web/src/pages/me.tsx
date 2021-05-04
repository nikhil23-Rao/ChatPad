import React from 'react';
import meStyles from '../styles/me.module.css';

interface MeProps {}

const Me: React.FC<MeProps> = ({}) => {
  return (
    <div className="site" style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <img
          src="https://source.unsplash.com/random"
          style={{
            maxWidth: '100%',
            width: 880,
            left: 460,
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 8,
            height: 255,
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
          <div className="pc-user-info" style={{ textAlign: 'center', right: '44.45%', position: 'absolute' }}>
            <h3 style={{ top: 190, left: 22, position: 'relative', fontFamily: 'Lato' }}>
              <p>Nikhil Rao</p>
            </h3>
            <h3 style={{ top: 190, left: 22, position: 'relative', fontFamily: 'Lato', color: 'gray' }}>
              <p>nikhil23.rao@gmail.com</p>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Me;
