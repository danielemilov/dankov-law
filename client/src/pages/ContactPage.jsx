import Contact from '../components/home/Contact/Contact.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import useSmartBack from '../hooks/useSmartBack.js';

import './HomePage.css';

export default function ContactPage() {
  const goBack = useSmartBack('/');

  return (
    <main className="hlHome">
      <Contact
        pageMode
        onBack={goBack}
      />

      <Footer />
    </main>
  );
}