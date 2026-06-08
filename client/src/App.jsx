import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import CookieBanner from './components/CookieBanner';

import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivatePage';
import AboutPage from './pages/AboutPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import BrandIntroLoader from './components/BrandIntroLoader.jsx';

export default function App() {
  return (
    <>
      <BrandIntroLoader oncePerSession />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/za-advokata" element={<AboutPage />} />
        <Route path="/novini" element={<NewsPage />} />
        <Route path="/novini/:slug" element={<NewsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>

      <ChatWidget />
      <CookieBanner />


      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#0f0e0c',
            color: '#f5f2ec',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            borderRadius: 0,
          },
        }}
      />
    </>
  );
}
