import { NextSeo } from 'next-seo';
import Page from '@/components/page';
import Header from '@/components/header';
import VideoSection from '@/components/video-section';
import ListSection from '@/components/list-section';
import FeatureSection from '@/components/feature-section';
import CasesSection from '@/components/cases-section';
import PricingTable from '@/components/pricing-table';
import Footer from '@/components/footer';
import { useEffect } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';

export default function LandingPage() {
  const [session] = useSession();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (session || token) {
      router.push('/feed');
    }
  }, [session]);
  return (
    <Page>
      <NextSeo title="ChatPad" description="An Advanced Chat App." />
      <Header />
      <main>
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
