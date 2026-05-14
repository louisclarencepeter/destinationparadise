import { useRef } from 'react';
import AboutCommunity from '../components/about/AboutCommunity.jsx';
import AboutCta from '../components/about/AboutCta.jsx';
import AboutDestinations from '../components/about/AboutDestinations.jsx';
import AboutHero from '../components/about/AboutHero.jsx';
import AboutMission from '../components/about/AboutMission.jsx';
import AboutStory from '../components/about/AboutStory.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { usePinnedTimelinePhoto } from '../hooks/usePinnedTimelinePhoto.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/about.css';

const ABOUT_META_DESCRIPTION = 'Destination Paradise was born from a dream — to share the beauty, culture and spirit of Tanzania. Now officially launching in Unguja, Zanzibar, with Pemba, Mafia Island and the mainland to come.';

export default function About() {
  const pageRef = useRef(null);

  usePageMeta('About Us · Destination Paradise', ABOUT_META_DESCRIPTION);
  useRevealOnScroll(pageRef);
  usePinnedTimelinePhoto(pageRef);

  return (
    <main className="about-page" ref={pageRef}>
      <AboutHero />
      <AboutStory />
      <AboutMission />
      <AboutCommunity />
      <AboutDestinations />
      <AboutCta />
    </main>
  );
}
