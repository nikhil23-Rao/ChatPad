import { NextSeo } from 'next-seo';
import Page from '@/components/page';
import Header from '@/components/header';
import VideoSection from '@/components/video-section';
import ListSection from '@/components/list-section';
import FeatureSection from '@/components/feature-section';
import CasesSection from '@/components/cases-section';
import PricingTable from '@/components/pricing-table';
import Footer from '@/components/footer';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';
import { Spinner } from '@chakra-ui/react';
import { tw } from 'twind';
import { LinearProgress } from '@material-ui/core';
import Feed from './feed';
import { LINEAR_MAGIC } from '@/constants/vars/messageColors';

export default function LandingPage() {
  const [splash, setSplash] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [session] = useSession();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (session || token) {
      setSplash(true);
      setTimeout(() => {
        setShowContent(true);
      }, 3650);
    }
    (document.body.style as any) = 'overflow: hidden';
    if (
      (splash &&
        document.visibilityState === 'visible' &&
        typeof window !== 'undefined' &&
        window.screen.availHeight < 863) ||
      (typeof window !== 'undefined' && window.screen.availWidth) < 1800
    )
      document.body.style.zoom = '80%';
  }, [session]);

  if (splash) {
    console.log(showContent);
    if (showContent) return <Feed />;
  }
  if (splash) {
    return (
      <>
        <div className="cover" id="splash">
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'whitesmoke',
              // backgroundAttachment: 'fixed',
              // backgroundImage: 'linear-gradient(#009afe 0%, rgb(146, 0, 255) 50%)',
              width: 190,
              height: 190,
              borderRadius: '200px 200px 200px 20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                width: 170,
                height: 170,
                top: 10,
                left: 10,
                position: 'relative',
                borderRadius: '200px 200px 200px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{ backgroundColor: '#1c1c1c', width: 30, height: 30, borderRadius: 100, marginRight: 10 }}
              ></div>
              <div
                style={{ backgroundColor: '#1c1c1c', width: 30, height: 30, borderRadius: 100, marginRight: 10 }}
              ></div>
              <div
                style={{ backgroundColor: '#1c1c1c', width: 30, height: 30, borderRadius: 100, marginRight: 10 }}
              ></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Page>
      <NextSeo title="ChatPad" description="A Simple Chat App." />
      <Header />
      <main style={{ overflow: 'scroll' }}>
        <VideoSection />
        <ListSection />
        <FeatureSection />
        <CasesSection />
        <PricingTable />
      </main>
      <Footer />
    </Page>
  );
}
