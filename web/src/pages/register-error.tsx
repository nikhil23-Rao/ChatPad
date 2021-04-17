import React from 'react';
import registerErrorStyles from '@/styles/error.module.css';
import Link from 'next/link';

interface registerErrorProps {}

const RegisterError: React.FC<registerErrorProps> = ({}) => {
  return (
    <>
      <div id={registerErrorStyles.cloud}>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x1}`}></div>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x1_5}`}></div>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x2}`}></div>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x3}`}></div>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x4}`}></div>
        <div className={`${registerErrorStyles.cloud} ${registerErrorStyles.x5}`}></div>
      </div>
      <div className={registerErrorStyles.c}>
        <div className={registerErrorStyles._404}>Oops!</div>
        <br />
        <br />
        <div className={registerErrorStyles._1}>Something Went Wrong When Logging/Registering You In.</div>
        <Link href="/register">
          <a className={registerErrorStyles.btn} style={{ marginTop: 80 }}>
            BACK TO REGISTER
          </a>
        </Link>
        <Link href="/login">
          <a className={registerErrorStyles.btn} style={{ marginTop: 80 }}>
            BACK TO LOGIN
          </a>
        </Link>
      </div>
    </>
  );
};

export default RegisterError;
