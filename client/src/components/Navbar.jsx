import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const LAWYER_PHOTO = '/diyan-dankovv.jpg';

const navLinks = [
  {
    label: 'За адвоката',
    href: '/za-advokata',
  },
  {
    label: 'Новини',
    href: '/novini',
  },
  {
    label: 'Контакт',
    href: '/kontakt',
  },
  {
    label: 'Чат',
    href: '#chat',
    action: 'chat',
  },
];

const mobileNavLinks = navLinks;

const easeOutSoft = [0.16, 1, 0.3, 1];
const easeExitSoft = [0.4, 0, 0.2, 1];
const easeSweep = [0.76, 0, 0.24, 1];

const overlayVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px) saturate(1)',
  },

  visible: {
    opacity: 1,
    backdropFilter: 'blur(20px) saturate(1.1)',
    transition: {
      duration: 0.38,
      ease: easeOutSoft,
    },
  },

  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px) saturate(1)',
    transition: {
      duration: 0.2,
      ease: easeOutSoft,
    },
  },
};

const glassClearVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(22px)',
  },

  visible: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(22px)',
  },

  exit: {
    opacity: [0, 0.42, 0.28, 0],
    scale: [0.9, 1.05, 1.28, 1.5],
    filter: ['blur(24px)', 'blur(12px)', 'blur(5px)', 'blur(0px)'],
    transition: {
      duration: 1.14,
      times: [0, 0.36, 0.72, 1],
      ease: easeOutSoft,
    },
  },
};

const cinematicSweepVariants = {
  hidden: {
    left: '-58%',
    opacity: 0,
  },

  visible: {
    left: '-58%',
    opacity: 0,
  },

  exit: {
    left: ['-58%', '118%'],
    opacity: [0, 0.78, 0],
    transition: {
      duration: 1.02,
      ease: easeSweep,
    },
  },
};

const lensRingVariants = {
  hidden: {
    opacity: 0,
    scale: 0.82,
    filter: 'blur(8px)',
  },

  visible: {
    opacity: 0,
    scale: 0.82,
    filter: 'blur(8px)',
  },

  exit: {
    opacity: [0, 0.34, 0],
    scale: [0.82, 1.16, 1.68],
    filter: ['blur(9px)', 'blur(2px)', 'blur(18px)'],
    transition: {
      duration: 1.06,
      ease: easeOutSoft,
    },
  },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: 'blur(0px)',
    clipPath: 'inset(0% 0% 0% 0% round 42px)',
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    clipPath: 'inset(0% 0% 0% 0% round 42px)',
    transition: {
      duration: 0.46,
      ease: easeOutSoft,
    },
  },

  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(8px)',
    clipPath: 'inset(0% 0% 0% 0% round 42px)',
    transition: {
      duration: 0.18,
      ease: easeOutSoft,
    },
  },
};

const innerGlassVariants = {
  hidden: {
    opacity: 0,
    left: '-45%',
  },

  visible: {
    opacity: 0,
    left: '-45%',
  },

  exit: {
    opacity: [0, 0.68, 0],
    left: ['-45%', '24%', '86%'],
    transition: {
      duration: 0.96,
      ease: easeOutSoft,
    },
  },
};

const linkVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'blur(0px)',
  },

  visible: (index) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.06 + index * 0.045,
      duration: 0.34,
      ease: easeOutSoft,
    },
  }),

  exit: (index) => ({
    opacity: [1, 0.72, 0],
    y: [0, -4, -12],
    filter: ['blur(0px)', 'blur(2px)', 'blur(9px)'],
    transition: {
      delay: (mobileNavLinks.length - 1 - index) * 0.028,
      duration: 0.46,
      ease: easeExitSoft,
    },
  }),
};

const ctaVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'blur(0px)',
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.21,
      duration: 0.36,
      ease: easeOutSoft,
    },
  },

  exit: {
    opacity: [1, 0.88, 0.24, 0],
    y: [0, -4, -12, -18],
    filter: ['blur(0px)', 'blur(1px)', 'blur(7px)', 'blur(14px)'],
    transition: {
      duration: 0.58,
      ease: easeExitSoft,
    },
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener('keydown', onKeyDown);
    }

    return () => {
      document.body.classList.remove('nav-menu-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((value) => !value);
  };

  const openChat = (event) => {
    event?.preventDefault();

    closeMenu();

    window.dispatchEvent(
      new CustomEvent('dankov:open-chat')
    );
  };

  const navigateFromNavbar = (event, href) => {
    event?.preventDefault();

    closeMenu();

    if (href === '/') {
      window.dispatchEvent(
        new CustomEvent('dankov:reset-home')
      );
    }

    navigate(href, {
      state: {
        navigationSource: 'navbar',
        navigationRequestId: `${Date.now()}-${Math.random()}`,
      },
    });
  };

  return (
    <>
      <motion.header
        ref={rootRef}
        className={`navPrime ${
          scrolled ? 'navPrime--scrolled' : ''
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.35,
          ease: easeOutSoft,
        }}
      >
        <div className="navPrime__stage">
          <div className="navPrime__bar">
            <span
              className="navPrime__cursorGlow"
              aria-hidden="true"
            />

            <span
              className="navPrime__halo navPrime__halo--left"
              aria-hidden="true"
            />

            <span
              className="navPrime__halo navPrime__halo--center"
              aria-hidden="true"
            />

            <span
              className="navPrime__halo navPrime__halo--right"
              aria-hidden="true"
            />

            <span
              className="navPrime__shine navPrime__shine--main"
              aria-hidden="true"
            />

            <span
              className="navPrime__shine navPrime__shine--soft"
              aria-hidden="true"
            />

            <span
              className="navPrime__edge navPrime__edge--top"
              aria-hidden="true"
            />

            <span
              className="navPrime__edge navPrime__edge--bottom"
              aria-hidden="true"
            />

            <a
              className="navPrime__brand"
              href="/"
              onClick={(event) => navigateFromNavbar(event, '/')}
              data-navigation-source="navbar"
              aria-label="Към официалната начална страница"
            >
              <span className="navPrime__photo">
                <span
                  className="navPrime__photoGlow"
                  aria-hidden="true"
                />

                <img
                  src={LAWYER_PHOTO}
                  alt="Адвокат Диян Данков"
                />
              </span>

              <span className="navPrime__brandText">
                <span className="navPrime__name">
                  <strong>Диян</strong>
                  <strong>Данков</strong>
                </span>

                <span className="navPrime__role">
                  Адвокат
                </span>
              </span>
            </a>

            <nav
              className="navPrime__dock"
              aria-label="Основна навигация"
            >
              <span
                className="navPrime__dockSweep"
                aria-hidden="true"
              />

              <span
                className="navPrime__dockGlow"
                aria-hidden="true"
              />

              {navLinks.map((link) => (
                <a
                  className="navPrime__link"
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  onClick={(event) =>
                    link.action === 'chat'
                      ? openChat(event)
                      : navigateFromNavbar(event, link.href)
                  }
                  data-navigation-source="navbar"
                >
                  <span
                    className="navPrime__linkFill"
                    aria-hidden="true"
                  />

                  <span className="navPrime__linkText">
                    {link.label}
                  </span>
                </a>
              ))}
            </nav>

            <div className="navPrime__actions">
              <a
                className="navPrime__cta"
                href="/kontakt#booking"
                onClick={(event) =>
                  navigateFromNavbar(event, '/kontakt#booking')
                }
                data-navigation-source="navbar"
              >
                <span
                  className="navPrime__ctaShine"
                  aria-hidden="true"
                />

                <span className="navPrime__ctaText">
                  Запази час
                </span>
              </a>

              <button
                className={`navPrime__burger ${
                  menuOpen ? 'is-open' : ''
                }`}
                type="button"
                onClick={toggleMenu}
                aria-label={
                  menuOpen
                    ? 'Затвори менюто'
                    : 'Отвори менюто'
                }
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X
                    size={25}
                    strokeWidth={2.4}
                  />
                ) : (
                  <Menu
                    size={25}
                    strokeWidth={2.4}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            className="navPrimeMobile"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeMenu();
              }
            }}
          >
            <motion.span
              className="navPrimeMobile__glassClear"
              variants={glassClearVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
            />

            <motion.span
              className="navPrimeMobile__cinematicSweep"
              variants={cinematicSweepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
            />

            <motion.span
              className="navPrimeMobile__lensRing"
              variants={lensRingVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
            />

            <motion.div
              className="navPrimeMobile__panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span
                className="navPrimeMobile__shine"
                aria-hidden="true"
              />

              <span
                className="navPrimeMobile__orb navPrimeMobile__orb--one"
                aria-hidden="true"
              />

              <span
                className="navPrimeMobile__orb navPrimeMobile__orb--two"
                aria-hidden="true"
              />

              <motion.span
                className="navPrimeMobile__innerGlass"
                variants={innerGlassVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                aria-hidden="true"
              />

              <nav
                className="navPrimeMobile__links"
                aria-label="Мобилна навигация"
              >
                {mobileNavLinks.map((link, index) => (
                  <motion.a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    onClick={(event) =>
                      link.action === 'chat'
                        ? openChat(event)
                        : navigateFromNavbar(event, link.href)
                    }
                    data-navigation-source="navbar"
                    custom={index}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <span className="navPrimeMobile__copy">
                      <strong>{link.label}</strong>
                    </span>
                  </motion.a>
                ))}
              </nav>

              <motion.a
                className="navPrimeMobile__cta"
                href="/kontakt#booking"
                onClick={(event) =>
                  navigateFromNavbar(event, '/kontakt#booking')
                }
                data-navigation-source="navbar"
                variants={ctaVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <span>Запази консултация</span>

                <ArrowUpRight
                  size={18}
                  strokeWidth={2.2}
                />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
