import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Navbar.css';

const LAWYER_PHOTO = '/diyan-dankovv.jpg';

const navLinks = [
  { label: 'За адвоката', href: '#about' },
  { label: 'Казуси', href: '#cases' },
  { label: 'Видео', href: '#video' },
  { label: 'Контакт', href: '#contact' },
];

export default function Navbar() {
  const rootRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    document.body.classList.toggle('nav-menu-open', menuOpen);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('nav-menu-open');
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        ref={rootRef}
        className={`navPrime ${scrolled ? 'navPrime--scrolled' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navPrime__stage">
          <div className="navPrime__bar">
            <span className="navPrime__cursorGlow" aria-hidden="true" />

            <span className="navPrime__halo navPrime__halo--left" aria-hidden="true" />
            <span className="navPrime__halo navPrime__halo--center" aria-hidden="true" />
            <span className="navPrime__halo navPrime__halo--right" aria-hidden="true" />

            <span className="navPrime__shine navPrime__shine--main" aria-hidden="true" />
            <span className="navPrime__shine navPrime__shine--soft" aria-hidden="true" />

            <span className="navPrime__edge navPrime__edge--top" aria-hidden="true" />
            <span className="navPrime__edge navPrime__edge--bottom" aria-hidden="true" />

            <a className="navPrime__brand" href="#home" onClick={closeMenu} aria-label="Към началото">
              <span className="navPrime__photo">
                <span className="navPrime__photoGlow" aria-hidden="true" />
                <img src={LAWYER_PHOTO} alt="Адвокат Диян Данков" />
              </span>

              <span className="navPrime__brandText">
                <span className="navPrime__name">
                  <strong>Диян</strong>
                  <strong>Данков</strong>
                </span>
                <span className="navPrime__role">Адвокат</span>
              </span>
            </a>

            <nav className="navPrime__dock" aria-label="Основна навигация">
              <span className="navPrime__dockSweep" aria-hidden="true" />
              <span className="navPrime__dockGlow" aria-hidden="true" />

              {navLinks.map((link) => (
                <a className="navPrime__link" key={link.href} href={link.href}>
                  <span className="navPrime__linkFill" aria-hidden="true" />
                  <span className="navPrime__linkText">{link.label}</span>
                </a>
              ))}
            </nav>

            <div className="navPrime__actions">
              <a className="navPrime__cta" href="#contact">
                <span className="navPrime__ctaShine" aria-hidden="true" />
                <span className="navPrime__ctaText">Запази час</span>
              </a>

              <button
                className={`navPrime__burger ${menuOpen ? 'is-open' : ''}`}
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? 'Затвори менюто' : 'Отвори менюто'}
                aria-expanded={menuOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navPrimeMobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="navPrimeMobile__panel"
              initial={{ opacity: 0, scale: 0.985, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="navPrimeMobile__shine" aria-hidden="true" />
              <span className="navPrimeMobile__orb navPrimeMobile__orb--one" aria-hidden="true" />
              <span className="navPrimeMobile__orb navPrimeMobile__orb--two" aria-hidden="true" />

              <div className="navPrimeMobile__intro">
                <p>Навигация</p>
                <strong>Изберете секция</strong>
              </div>

              <nav className="navPrimeMobile__links" aria-label="Мобилна навигация">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.08 + index * 0.06,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="navPrimeMobile__number">0{index + 1}</span>
                    <strong>{link.label}</strong>
                    <span className="navPrimeMobile__arrow" aria-hidden="true">↗</span>
                  </motion.a>
                ))}
              </nav>

              <a className="navPrimeMobile__cta" href="#contact" onClick={closeMenu}>
                Запази консултация ↗
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
