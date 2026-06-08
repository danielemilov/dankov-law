import { useEffect, useState } from 'react';
import AboutMobilePage from '../components/home/AboutMobilePage/AboutMobilePage.jsx';
import AttorneyCinematic from '../components/home/AttorneyCinematic/AttorneyCinematic.jsx';
import Cases from '../components/home/Cases/Cases.jsx';
import Contact from '../components/home/Contact/Contact.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import Hero from '../components/home/Hero/Hero.jsx';
import './HomePage.css';

function isMobileContactViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 720px)').matches;
}

export default function HomePage() {
  const [mobileAboutVisible, setMobileAboutVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isMobileContactViewport() && window.location.hash === '#about';
  });

  const [mobileCasesVisible, setMobileCasesVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isMobileContactViewport() && (window.location.hash === '#cases' || window.location.search.includes('case='));
  });

  const [mobileContactVisible, setMobileContactVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isMobileContactViewport() || window.location.hash === '#contact' || window.location.hash === '#booking';
  });

  useEffect(() => {
    function revealAbout() {
      if (!isMobileContactViewport()) return;
      setMobileAboutVisible(true);
      setMobileCasesVisible(false);
      setMobileContactVisible(false);
    }

    function revealCases({ shouldScroll = false } = {}) {
      if (!isMobileContactViewport()) return;
      setMobileAboutVisible(false);
      setMobileCasesVisible(true);
      setMobileContactVisible(false);

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          document.querySelector('#cases')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }
    }

    function revealContact({ shouldScroll = false } = {}) {
      setMobileAboutVisible(false);
      setMobileCasesVisible(false);
      setMobileContactVisible(true);

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const target =
              window.location.hash === '#booking'
                ? document.querySelector('#booking')
                : document.querySelector('#contact');

            target?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          });
        });
      }
    }

    function resetMobileHome({ shouldScroll = false } = {}) {
      setMobileAboutVisible(false);
      setMobileCasesVisible(false);

      if (isMobileContactViewport()) {
        setMobileContactVisible(false);
      } else {
        setMobileContactVisible(true);
      }

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          document.querySelector('#home')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }
    }

    function syncFromViewport() {
      if (!isMobileContactViewport()) {
        setMobileAboutVisible(false);
        setMobileCasesVisible(false);
        setMobileContactVisible(true);
        return;
      }

      setMobileAboutVisible(window.location.hash === '#about');
      setMobileCasesVisible(window.location.hash === '#cases' || window.location.search.includes('case='));
      setMobileContactVisible(window.location.hash === '#contact' || window.location.hash === '#booking');
    }

    function handleHashChange() {
      if (window.location.hash === '#about') {
        revealAbout();
      } else if (window.location.hash === '#contact' || window.location.hash === '#booking') {
        revealContact({ shouldScroll: true });
      } else if (window.location.hash === '#cases') {
        revealCases({ shouldScroll: true });
      } else if (window.location.hash === '#home' || window.location.hash === '') {
        resetMobileHome({ shouldScroll: window.location.hash === '#home' });
      }
    }

    function handleOpenContact() {
      revealContact({ shouldScroll: true });
    }

    function handleResetHome() {
      resetMobileHome({ shouldScroll: true });
    }

    function handleAboutLinkClick(event) {
      const link = event.target.closest?.('a[href="#about"]');
      if (!link || !isMobileContactViewport()) return;

      event.preventDefault();
      if (window.location.hash !== '#about') {
        window.history.pushState(null, '', '#about');
      }
      revealAbout();
    }

    function handleContactLinkClick(event) {
      const link = event.target.closest?.('a[href="#contact"], a[href="#booking"]');
      if (!link || !isMobileContactViewport()) return;

      event.preventDefault();
      const href = link.getAttribute('href');
      if (window.location.hash !== href) {
        window.history.pushState(null, '', href);
      }
      revealContact({ shouldScroll: true });
    }

    function handleCasesLinkClick(event) {
      const link = event.target.closest?.('a[href="#cases"]');
      if (!link || !isMobileContactViewport()) return;

      event.preventDefault();
      if (window.location.hash !== '#cases') {
        window.history.pushState(null, '', '#cases');
      }
      revealCases({ shouldScroll: true });
    }

    function handleHomeLinkClick(event) {
      const link = event.target.closest?.('a[href="#home"], a[href="/"], a[href="./"]');
      if (!link || !isMobileContactViewport()) return;

      event.preventDefault();
      if (window.location.hash !== '#home') {
        window.history.pushState(null, '', '#home');
      }
      resetMobileHome({ shouldScroll: true });
    }

    const media = window.matchMedia('(max-width: 720px)');

    syncFromViewport();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('dankov:open-contact', handleOpenContact);
    window.addEventListener('dankov:reset-home', handleResetHome);
    window.addEventListener('click', handleAboutLinkClick, true);
    window.addEventListener('click', handleContactLinkClick, true);
    window.addEventListener('click', handleCasesLinkClick, true);
    window.addEventListener('click', handleHomeLinkClick, true);
    media.addEventListener?.('change', syncFromViewport);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('dankov:open-contact', handleOpenContact);
      window.removeEventListener('dankov:reset-home', handleResetHome);
      window.removeEventListener('click', handleAboutLinkClick, true);
      window.removeEventListener('click', handleContactLinkClick, true);
      window.removeEventListener('click', handleCasesLinkClick, true);
      window.removeEventListener('click', handleHomeLinkClick, true);
      media.removeEventListener?.('change', syncFromViewport);
    };
  }, []);

  function closeMobileCases() {
    setMobileAboutVisible(false);
    setMobileCasesVisible(false);
    setMobileContactVisible(false);
    window.history.pushState(null, '', '#home');
    window.requestAnimationFrame(() => {
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closeMobileContact() {
    setMobileAboutVisible(false);
    setMobileCasesVisible(false);
    setMobileContactVisible(false);
    window.history.pushState(null, '', '#home');
    window.requestAnimationFrame(() => {
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const showMobileContactPage = typeof window !== 'undefined' && isMobileContactViewport() && mobileContactVisible;

  useEffect(() => {
    document.body.classList.toggle(
      'mobile-section-page-open',
      mobileAboutVisible || mobileCasesVisible || showMobileContactPage
    );

    return () => {
      document.body.classList.remove('mobile-section-page-open');
    };
  }, [mobileAboutVisible, mobileCasesVisible, showMobileContactPage]);

  useEffect(() => {
    if (!showMobileContactPage || window.location.hash !== '#booking') return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.querySelector('#booking')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }, [showMobileContactPage]);

  function closeMobileAbout() {
    setMobileAboutVisible(false);
    setMobileCasesVisible(false);
    setMobileContactVisible(false);
    window.history.pushState(null, '', '#home');
    window.requestAnimationFrame(() => {
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (mobileAboutVisible) {
    return (
      <main className="hlHome">
        <AboutMobilePage onBack={closeMobileAbout} />
        <Footer />
      </main>
    );
  }

  if (mobileCasesVisible) {
    return (
      <main className="hlHome">
        <Cases pageMode onBack={closeMobileCases} />
        <Footer />
      </main>
    );
  }

  if (showMobileContactPage) {
    return (
      <main className="hlHome">
        <Contact pageMode onBack={closeMobileContact} />
        <Footer />
      </main>
    );
  }

  return (
    <main className="hlHome">
      <Hero />
      <AttorneyCinematic />
      <Cases />

      {mobileContactVisible && <Contact />}
      <Footer />
    </main>
  );
}
