import AboutMobilePage from '../components/home/AboutMobilePage/AboutMobilePage.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import useSmartBack from '../hooks/useSmartBack.js';

import './HomePage.css';

export default function AboutPage() {
  const goBack = useSmartBack('/');

  return (
    <main className="hlHome">
      <AboutMobilePage onBack={goBack} />
      <Footer />
    </main>
  );
}