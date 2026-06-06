import Cases from '../components/home/Cases/Cases.jsx';
import Contact from '../components/home/Contact/Contact.jsx';
import Footer from '../components/home/Footer/Footer.jsx';
import Hero from '../components/home/Hero/Hero.jsx';
import './HomePage.css';

export default function HomePage() {
  return (
    <main className="hlHome">
      <Hero />

      <Cases />
      <Contact />
      <Footer />
    </main>
  );
}
