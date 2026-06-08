import { useNavigate } from 'react-router-dom';

import Contact from '../components/home/Contact/Contact.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import './HomePage.css';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <main className="hlHome">
      <Contact
        pageMode
        onBack={() => navigate('/')}
      />

      <Footer />
    </main>
  );
}