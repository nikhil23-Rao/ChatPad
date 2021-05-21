import { NextSeo } from 'next-seo';
import Page from '@/components/page';
import Header from '@/components/header';
import VideoSection from '@/components/video-section';
import ListSection from '@/components/list-section';
import FeatureSection from '@/components/feature-section';
import CasesSection from '@/components/cases-section';
import PricingTable from '@/components/pricing-table';
import Footer from '@/components/footer';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';
import { Spinner } from '@chakra-ui/react';
import { tw } from 'twind';

export default function LandingPage() {
  const [splash, setSplash] = useState(false);
  const [session] = useSession();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (session || token) {
      setSplash(true);
      setTimeout(() => {
        window.location.href = '/feed';
      }, 500);
    }
    (document.body.style as any) = 'overflow: scroll';
  }, [session]);

  if (splash) {
    (document.body.style as any) = 'background-color: #FDFDFC';
    return (
      <>
        <div style={{ backgroundColor: '#FCFDFC', flex: 1 }}>
          <img
            style={{ position: 'fixed', top: '46%', left: '50%', transform: 'translate(-50%, -50%)' }}
            src="/images/people.png"
            alt=""
          />
          <div
            style={{
              position: 'relative',
              top:
                (typeof window !== 'undefined' && window.screen.availHeight < 863) ||
                (typeof window !== 'undefined' && window.screen.availWidth) < 1800
                  ? 540
                  : 530,
            }}
          ></div>
          <Spinner
            thickness="4px"
            style={{ position: 'fixed', top: '70%', left: '49%', transform: 'translate(-50%, -50%)' }}
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
          <p
            className={tw('text-3xl text-primary-100 font-bold')}
            style={{
              color: 'gray',
              fontSize: 27,
              marginLeft: 'auto',
              marginRight: 'auto',
              top: 530,
              left: 650,
              position: 'fixed',
            }}
          >
            Chat With Friends And Family. Anytime, Anywhere.
          </p>
        </div>
      </>
    );
  }

  return (
    <Page>
      <NextSeo title="ChatPad" description="An Advanced Chat App." />
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
