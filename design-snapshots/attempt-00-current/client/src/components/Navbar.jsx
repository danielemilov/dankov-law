import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './Navbar.css';

gsap.registerPlugin(useGSAP);

const LAWYER_PHOTO = '/diyan-dankovv.jpg';

const navLinks = [
  { label: 'За адвоката', href: '#about' },
  { label: 'Казуси', href: '#cases' },
  { label: 'Видео', href: '#video' },
  { label: 'Контакт', href: '#contact' },
];

export default function Navbar() {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const glowRef = useRef(null);
  const ctaRef = useRef(null);

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

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const bar = barRef.current;
      const glow = glowRef.current;
      const cta = ctaRef.current;

      if (!root || !bar || !glow || !cta) return;

      const q = gsap.utils.selector(root);
      const links = q('.navPrime__link');
      const fills = q('.navPrime__linkFill');
      const texts = q('.navPrime__linkText');

      const cleanup = [];

      gsap.set([bar, cta, ...links, ...texts], {
        opacity: 1,
        visibility: 'visible',
        clearProps: 'transform',
      });

      gsap.set(glow, {
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 0.88,
      });

      gsap.set(fills, {
        opacity: 0,
        scaleX: 0.18,
        transformOrigin: '50% 50%',
      });

      gsap.from(bar, {
        opacity: 0,
        filter: 'blur(14px)',
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'filter',
      });

      const glowX = gsap.quickTo(glow, 'x', {
        duration: 0.35,
        ease: 'power3.out',
      });

      const glowY = gsap.quickTo(glow, 'y', {
        duration: 0.35,
        ease: 'power3.out',
      });

      const onMove = (event) => {
        const rect = bar.getBoundingClientRect();

        glowX(event.clientX - rect.left);
        glowY(event.clientY - rect.top);

        gsap.to(glow, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: 'power3.out',
          overwrite: true,
        });
      };

      const onLeave = () => {
        gsap.to(glow, {
          opacity: 0,
          scale: 0.88,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: true,
        });
      };

      bar.addEventListener('mousemove', onMove);
      bar.addEventListener('mouseleave', onLeave);

      cleanup.push(() => {
        bar.removeEventListener('mousemove', onMove);
        bar.removeEventListener('mouseleave', onLeave);
      });

      links.forEach((link) => {
        const fill = link.querySelector('.navPrime__linkFill');
        const text = link.querySelector('.navPrime__linkText');

        const enter = () => {
          gsap.to(fill, {
            opacity: 1,
            scaleX: 1,
            duration: 0.25,
            ease: 'power4.out',
            overwrite: true,
          });

          gsap.to(text, {
            color: '#ffffff',
            duration: 0.16,
            ease: 'power2.out',
            overwrite: true,
          });
        };

        const leave = () => {
          gsap.to(fill, {
            opacity: 0,
            scaleX: 0.18,
            duration: 0.28,
            ease: 'power4.out',
            overwrite: true,
          });

          gsap.to(text, {
            color: 'rgba(255, 253, 244, 0.94)',
            duration: 0.16,
            ease: 'power2.out',
            overwrite: true,
          });
        };

        link.addEventListener('mouseenter', enter);
        link.addEventListener('mouseleave', leave);

        cleanup.push(() => {
          link.removeEventListener('mouseenter', enter);
          link.removeEventListener('mouseleave', leave);
        });
      });

      const ctaPulse = gsap.timeline({
        repeat: -1,
        repeatDelay: 3.2,
      });

      ctaPulse
        .to(cta, {
          boxShadow:
            '0 30px 86px rgba(13,20,15,.42), 0 0 62px rgba(201,221,114,.22), inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(0,0,0,.36)',
          duration: 0.5,
          ease: 'power3.out',
        })
        .to(cta, {
          boxShadow:
            '0 22px 58px rgba(13,20,15,.31), 0 0 36px rgba(201,221,114,.13), inset 0 1px 0 rgba(255,255,255,.15), inset 0 -1px 0 rgba(0,0,0,.32)',
          duration: 1,
          ease: 'power3.out',
        });

      return () => {
        ctaPulse.kill();
        cleanup.forEach((fn) => fn());
      };
    },
    { scope: rootRef }
  );

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
          <div ref={barRef} className="navPrime__bar">
            <span ref={glowRef} className="navPrime__cursorGlow" aria-hidden="true" />

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
              <a ref={ctaRef} className="navPrime__cta" href="#contact">
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

              <div className="navPrimeMobile__top">
                <div className="navPrimeMobile__identity">
                  <span className="navPrimeMobile__photo">
                    <img src={LAWYER_PHOTO} alt="Адвокат Диян Данков" />
                  </span>

                  <span>
                    <strong>Диян Данков</strong>
                    <small>Адвокат</small>
                  </span>
                </div>

                <button type="button" onClick={closeMenu} aria-label="Затвори менюто">
                  ×
                </button>
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
                    <span className="navPrimeMobile__arrow">↗</span>
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