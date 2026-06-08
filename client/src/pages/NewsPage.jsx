import { useNavigate, useParams } from 'react-router-dom';
import Cases from '../components/home/Cases/Cases.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import './HomePage.css';

export default function NewsPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams();

  return (
    <main className="hlHome">
      <Cases pageMode initialSlug={slug} onBack={() => navigate('/')} />
      <Footer />
    </main>
  );
}
