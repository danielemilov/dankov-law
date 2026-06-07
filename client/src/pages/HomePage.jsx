import { useEffect, useState } from 'react';
import Cases from '../components/home/Cases/Cases.jsx';
import Contact from '../components/home/Contact/Contact.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import Hero from '../components/home/Hero/Hero.jsx';
import VideoHero from '../components/home/VideoHero/VideoHero.jsx';
import './HomePage.css';

function isMobileContactViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 720px)').matches;
}

export default function HomePage() {
  const [mobileContactVisible, setMobileContactVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isMobileContactViewport() || window.location.hash === '#contact';
  });

  useEffect(() => {
    function revealContact({ shouldScroll = false } = {}) {
      setMobileContactVisible(true);

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            document.querySelector('#contact')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          });
        });
      }
    }

    function resetMobileHome({ shouldScroll = false } = {}) {
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
        setMobileContactVisible(true);
        return;
      }

      setMobileContactVisible(window.location.hash === '#contact');
    }

    function handleHashChange() {
      if (window.location.hash === '#contact') {
        revealContact({ shouldScroll: true });
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

    function handleContactLinkClick(event) {
      const link = event.target.closest?.('a[href="#contact"]');
      if (!link || !isMobileContactViewport()) return;

      event.preventDefault();
      if (window.location.hash !== '#contact') {
        window.history.pushState(null, '', '#contact');
      }
      revealContact({ shouldScroll: true });
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
    window.addEventListener('click', handleContactLinkClick, true);
    window.addEventListener('click', handleHomeLinkClick, true);
    media.addEventListener?.('change', syncFromViewport);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('dankov:open-contact', handleOpenContact);
      window.removeEventListener('dankov:reset-home', handleResetHome);
      window.removeEventListener('click', handleContactLinkClick, true);
      window.removeEventListener('click', handleHomeLinkClick, true);
      media.removeEventListener?.('change', syncFromViewport);
    };
  }, []);

  return (
    <main className="hlHome">
      <Hero />
      <VideoHero />
      <Cases />

      {mobileContactVisible && <Contact />}
      <Footer />
    </main>
  );
}
