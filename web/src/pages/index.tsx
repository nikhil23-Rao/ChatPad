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
      }, 3600);
    }
    (document.body.style as any) = 'overflow: hidden';
    if (splash && document.visibilityState === 'visible') document.body.style.zoom = '80%';
  }, [session]);

  if (splash) {
    console.log(showContent);
    if (showContent) return <Feed />;
  }
  if (splash) {
    return (
      <>
        <div className="cover" id="splash">
          <svg width="1792" id="icon" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1792 896q0 174-120 321.5t-326 233-450 85.5q-70 0-145-8-198 175-460 242-49 14-114 22-17 2-30.5-9t-17.5-29v-1q-3-4-.5-12t2-10 4.5-9.5l6-9 7-8.5 8-9q7-8 31-34.5t34.5-38 31-39.5 32.5-51 27-59 26-76q-157-89-247.5-220t-90.5-281q0-130 71-248.5t191-204.5 286-136.5 348-50.5q244 0 450 85.5t326 233 120 321.5z"
              fill="#fff"
            />
          </svg>
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
