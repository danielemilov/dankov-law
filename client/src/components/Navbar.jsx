import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSiteSettings from '../hooks/useSiteSettings.js';
import './Navbar.css';

const LAWYER_PHOTO = '/diyan-dankovv.jpg';

const defaultNavLinks = [
  {
    label: 'За адвоката',
    href: '/za-advokata',
    setting: 'showAbout',
    labelField: 'aboutLabel',
  },
  {
    label: 'Новини',
    href: '/novini',
    setting: 'showNews',
    labelField: 'newsLabel',
  },
  {
    label: 'Контакт',
    href: '/kontakt',
    setting: 'showContact',
    labelField: 'contactLabel',
  },
  {
    label: 'Чат',
    href: '#chat',
    action: 'chat',
    setting: 'showChat',
    labelField: 'chatLabel',
  },
];

const easeOutSoft = [0.16, 1, 0.3, 1];
const easeInOutSoft = [0.4, 0, 0.2, 1];

const headerVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: easeOutSoft,
    },
  },
};

const overlayVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px) saturate(1)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(12px) saturate(1.08)',
    transition: {
      duration: 0.28,
      ease: easeOutSoft,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px) saturate(1)',
    transition: {
      duration: 0.18,
      ease: easeInOutSoft,
    },
  },
};

const sheetVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.34,
      ease: easeOutSoft,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    filter: 'blur(8px)',
    transition: {
      duration: 0.2,
      ease: easeInOutSoft,
    },
  },
};

const mobileItemVariants = {
  hidden: {
    opacity: 0,
    x: -8,
  },
  visible: ({ index }) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.06 + index * 0.035,
      duration: 0.28,
      ease: easeOutSoft,
    },
  }),
  exit: ({ index, total }) => ({
    opacity: 0,
    x: -6,
    transition: {
      delay: Math.max(total - 1 - index, 0) * 0.018,
      duration: 0.16,
      ease: easeInOutSoft,
    },
  }),
};

function getPathname(href) {
  if (!href || href.startsWith('#')) {
    return href;
  }

  return href.split('#')[0] || '/';
}

function isLinkActive(link, pathname) {
  if (link.action === 'chat') {
    return false;
  }

  const linkPath = getPathname(link.href);

  if (linkPath === '/') {
    return pathname === '/';
  }

  return pathname === linkPath || pathname.startsWith(`${linkPath}/`);
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSiteSettings();
  const navigationSettings = settings.navigation || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    return defaultNavLinks
      .filter((link) => navigationSettings[link.setting] !== false)
      .map((link) => ({
        ...link,
        label: navigationSettings[link.labelField] || link.label,
      }));
  }, [navigationSettings]);

  const ctaHref = navigationSettings.ctaHref || '/kontakt#booking';
  const ctaLabel = navigationSettings.ctaLabel || 'Запази час';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 14);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

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
        className={`navPrime ${scrolled ? 'navPrime--scrolled' : ''} ${menuOpen ? 'navPrime--open' : ''}`}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="navPrime__stage">
          <div className="navPrime__bar">
            <a
              className="navPrime__brand navPrime__island"
              href="/"
              onClick={(event) => navigateFromNavbar(event, '/')}
              data-navigation-source="navbar"
              aria-label="Към официалната начална страница"
            >
              <span className="navPrime__photo" aria-hidden="true">
                <img
                  src={LAWYER_PHOTO}
                  alt=""
                />
              </span>

              <span className="navPrime__brandText">
                <span className="navPrime__name">Диян Данков</span>
                <span className="navPrime__role">Адвокат</span>
              </span>
            </a>

            <nav
              className="navPrime__dock navPrime__island"
              aria-label="Основна навигация"
            >
              {navLinks.map((link) => {
                const active = isLinkActive(link, location.pathname);

                return (
                  <a
                    className={`navPrime__link ${active ? 'is-active' : ''}`}
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    onClick={(event) =>
                      link.action === 'chat'
                        ? openChat(event)
                        : navigateFromNavbar(event, link.href)
                    }
                    data-navigation-source="navbar"
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="navPrime__linkText">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="navPrime__actions">
              <a
                className="navPrime__cta navPrime__island"
                href={ctaHref}
                onClick={(event) => navigateFromNavbar(event, ctaHref)}
                data-navigation-source="navbar"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight
                  size={15}
                  strokeWidth={2.3}
                  aria-hidden="true"
                />
              </a>

              <button
                className={`navPrime__burger navPrime__island ${menuOpen ? 'is-open' : ''}`}
                type="button"
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Затвори менюто' : 'Отвори менюто'}
                aria-expanded={menuOpen}
                aria-controls="navPrimeMobilePanel"
              >
                <span className="navPrime__burgerIcon" aria-hidden="true">
                  {menuOpen ? (
                    <X
                      size={22}
                      strokeWidth={2.3}
                    />
                  ) : (
                    <Menu
                      size={22}
                      strokeWidth={2.3}
                    />
                  )}
                </span>
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
            <motion.div
              id="navPrimeMobilePanel"
              className="navPrimeMobile__sheet"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <a
                className="navPrimeMobile__primary"
                href={ctaHref}
                onClick={(event) => navigateFromNavbar(event, ctaHref)}
                data-navigation-source="navbar"
              >
                <span>{navigationSettings.ctaLabel || 'Запази консултация'}</span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </a>

              <nav
                className="navPrimeMobile__links"
                aria-label="Мобилна навигация"
              >
                {navLinks.map((link, index) => {
                  const active = isLinkActive(link, location.pathname);
                  const custom = {
                    index,
                    total: navLinks.length,
                  };

                  return (
                    <motion.a
                      className={active ? 'is-active' : ''}
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      onClick={(event) =>
                        link.action === 'chat'
                          ? openChat(event)
                          : navigateFromNavbar(event, link.href)
                      }
                      data-navigation-source="navbar"
                      custom={custom}
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      aria-current={active ? 'page' : undefined}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight
                        size={15}
                        strokeWidth={2.1}
                        aria-hidden="true"
                      />
                    </motion.a>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
