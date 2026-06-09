import {
  lazy,
  Suspense,
} from 'react';

import {
  useLocation,
  Route,
  Routes,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import CookieBanner from './components/CookieBanner';
import BrandIntroLoader from './components/BrandIntroLoader.jsx';
import ScrollRestoration from './components/ScrollRestoration.jsx';

import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivatePage';
import AboutPage from './pages/AboutPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import useSiteSettings from './hooks/useSiteSettings.js';

const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const settings = useSiteSettings();

  return (
    <>
      <ScrollRestoration />

      {!isAdminRoute && settings.components?.brandIntroEnabled !== false && (
        <BrandIntroLoader oncePerSession />
      )}

      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/za-advokata"
          element={<AboutPage />}
        />

        <Route
          path="/novini"
          element={<NewsPage />}
        />

        <Route
          path="/novini/:slug"
          element={<NewsPage />}
        />

        <Route
          path="/kontakt"
          element={<ContactPage />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPage />}
        />

        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<main className="adminRouteFallback">Зареждане...</main>}>
              <AdminPage />
            </Suspense>
          }
        />
      </Routes>

      {!isAdminRoute && settings.chat?.enabled !== false && (
        <ChatWidget settings={settings.chat} />
      )}

      {!isAdminRoute && settings.components?.cookieBannerEnabled !== false && <CookieBanner />}

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
