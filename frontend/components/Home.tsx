import React from 'react';
import Hero from './Hero';
import FeaturedEvents from './FeaturedEvents';
import LeadershipSection from './LeadershipSection';
import FaqSection from './FaqSection';
import ClubsSection from './ClubsSection';
import DeveloperSection from './DeveloperSection';
import CallToAction from './CallToAction';
import { useLazyEvents, useLazyClubs, useLazyLeadership } from '../hooks/useLazySectionData';

interface HomeProps {
  users?: any[]; // Users data (if needed for home page)
}

const Home: React.FC<HomeProps> = () => {
  // Lazy-load section data only when components mount
  const { events, isLoading: eventsLoading, error: eventsError } = useLazyEvents();
  const { clubs, isLoading: clubsLoading, error: clubsError } = useLazyClubs();
  const { leadership, isLoading: leadershipLoading, error: leadershipError } = useLazyLeadership();

  // Debug logging
  React.useEffect(() => {
    if (events.length > 0) {
      console.log('📦 Events stored in Home component:', events.length);
    }
    if (eventsError) {
      console.error('❌ Events error in Home:', eventsError);
    }
  }, [events, eventsError]);

  return (
    <div className="space-y-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Hero />
      </div>
      <FeaturedEvents events={events} />
      <ClubsSection clubs={clubs} />
      <LeadershipSection leadership={leadership} />
      <CallToAction clubs={clubs} />
      <DeveloperSection />
      <FaqSection />
    </div>
  );
};

export default Home;