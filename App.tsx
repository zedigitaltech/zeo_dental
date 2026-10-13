import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Treatments } from './components/Treatments';
import { Philosophy } from './components/Philosophy';
import { Team } from './components/Team';
import { ClinicalCases } from './components/ClinicalCases';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BookingPage } from './components/BookingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { ReceptionistApp } from './components/receptionist/ReceptionistApp';
import { AgentApp } from './components/agent/AgentApp';
import { PayResultPage } from './components/pay/PayResultPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { TreatmentPage } from './components/TreatmentPage';
import { TreatmentsOverview } from './components/TreatmentsOverview';
import { PhilosophyPage } from './components/PhilosophyPage';
import { TeamPage } from './components/TeamPage';
import { ClinicalCasesPage } from './components/ClinicalCasesPage';
import { CookieConsent } from './components/CookieConsent';
import { CtScanCTA } from './components/CtScanCTA';
import { GoogleReviews } from './components/GoogleReviews';
import { PackagesPage } from './components/PackagesPage';
import { VideoTestimonials } from './components/VideoTestimonials';
import { stripLangPrefix } from './utils/i18n';

// Treatment page configurations with hero images (matching TreatmentsOverview)
const treatmentConfigs: Record<string, { key: string; heroImage: string }> = {
  '/treatments/implantology': {
    key: 'implantology',
    heroImage: 'https://i.pinimg.com/originals/60/04/b9/6004b9521440d181bde0a734d93b7184.jpg',
  },
  '/treatments/prosthetics': {
    key: 'prosthetics',
    heroImage: 'https://i.pinimg.com/originals/a1/30/09/a130095fbe716c5bb8e7be0713584fd0.jpg',
  },
  '/treatments/aligners': {
    key: 'aligners',
    heroImage: 'https://i.pinimg.com/originals/5a/9e/4b/5a9e4b3d06cecb638556ece73cb0417c.jpg',
  },
  '/treatments/orthodontics': {
    key: 'orthodontics',
    heroImage: 'https://i.pinimg.com/originals/d2/10/e6/d210e6d0cc27fca87fe4245aea34e071.jpg',
  },
  '/treatments/crowns': {
    key: 'crowns',
    heroImage: 'https://i.pinimg.com/originals/3d/90/fd/3d90fd9c0112b18067d6348072116872.jpg',
  },
  '/treatments/endodontics': {
    key: 'aesthetics',
    heroImage: '/images/treatments/endodontics.jpg',
  },
};

// Simple router based on pathname (strips /:lang/ prefix)
const useRoute = () => {
  const [route, setRoute] = useState(() => stripLangPrefix(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setRoute(stripLangPrefix(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return route;
};

// Main website component
const MainSite: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-studio-gold focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Treatments />
        <CtScanCTA />
        <Philosophy />
        <Team />
        <ClinicalCases />
        <GoogleReviews />
        <VideoTestimonials />
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};

const App: React.FC = () => {
  const route = useRoute();

  const renderRoute = () => {
    // Check for treatment pages
    if (treatmentConfigs[route]) {
      const { key, heroImage } = treatmentConfigs[route];
      return <TreatmentPage treatmentKey={key} heroImage={heroImage} />;
    }

    switch (route) {
      case '/receptionist':
        return <ReceptionistApp />;
      case '/agent':
        return <AgentApp />;
      case '/pay/thanks':
        return <PayResultPage outcome="thanks" />;
      case '/pay/failed':
        return <PayResultPage outcome="failed" />;
      case '/book':
        return <BookingPage />;
      case '/privacy-policy':
        return <PrivacyPolicy />;
      case '/terms-of-service':
        return <TermsOfService />;
      case '/treatments':
        return <TreatmentsOverview />;
      case '/philosophy':
        return <PhilosophyPage />;
      case '/team':
        return <TeamPage />;
      case '/cases':
        return <ClinicalCasesPage />;
      case '/packages':
        return <PackagesPage />;
      default:
        return <MainSite />;
    }
  };

  return (
    <LanguageProvider>
      <ErrorBoundary>
        {renderRoute()}
        <CookieConsent />
      </ErrorBoundary>
    </LanguageProvider>
  );
};

export default App;
