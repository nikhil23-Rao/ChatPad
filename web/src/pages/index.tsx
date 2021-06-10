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

export default function LandingPage() {
  const [splash, setSplash] = useState(false);
  const [session] = useSession();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (session || token) {
      setSplash(true);
      setTimeout(() => {
        window.history.pushState('', '', `/feed`);
        window.location.reload(false);
      }, 3000);
    }
    (document.body.style as any) = 'overflow: scroll';
  }, [session]);

  if (splash) {
    (document.body.style as any) = 'background-color: #3D91E3';
    return (
      <>
        <div className="cover">
          <svg width="1792" height="1792" viewBox="0 0 1792 1792" id="icon" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1764 11q33 24 27 64l-256 1536q-5 29-32 45-14 8-31 8-11 0-24-5l-453-185-242 295q-18 23-49 23-13 0-22-4-19-7-30.5-23.5t-11.5-36.5v-349l864-1059-1069 925-395-162q-37-14-40-55-2-40 32-59l1664-960q15-9 32-9 20 0 36 11z"
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
