import { useParams } from 'react-router-dom';

import Cases from '../components/home/Cases/Cases.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import useSmartBack from '../hooks/useSmartBack.js';

import './HomePage.css';

export default function NewsPage() {
  const { slug = '' } = useParams();

  /*
   * При директно отворена публикация fallback-ът е архивът.
   * При директно отворен архив fallback-ът е Homepage.
   */
  const goBack = useSmartBack(
    slug ? '/novini' : '/'
  );

  return (
    <main className="hlHome">
      <Cases
        pageMode
        initialSlug={slug}
        onBack={goBack}
      />

      <Footer />
    </main>
  );
}