import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import PageBackButton from '../../PageBackButton.jsx';
import './AboutMobilePage.css';

const ease = [0.16, 1, 0.3, 1];

const reveal = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(10px)',
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.78,
      ease,
    },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

export default function AboutMobilePage({ onBack }) {
  const pageRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
  });

  const portraitY = useTransform(
    scrollYProgress,
    [0, 0.48],
    [0, reduceMotion ? 0 : 48]
  );

  const copyY = useTransform(
    scrollYProgress,
    [0, 0.38],
    [0, reduceMotion ? 0 : -18]
  );

  const mapQuery = encodeURIComponent(
    'ул. Осъм 4, ет. 3, офис 321, Разград 7200, България'
  );

  const mapSrc =
    `https://maps.google.com/maps?hl=bg&q=${mapQuery}&z=17&ie=UTF8&iwloc=&output=embed`;

  const mapLink =
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  function handleBack() {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.history.length > 1
    ) {
      window.history.back();
      return;
    }

    window.location.assign('/');
  }

  return (
    <section
      ref={pageRef}
      className="aboutPulsePage"
      id="about"
      aria-labelledby="about-pulse-title"
    >
      <div
        className="aboutPulsePage__grain"
        aria-hidden="true"
      />

      <motion.div
        className="aboutPulsePage__shell"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.section
          className="aboutPulseHero"
          variants={reveal}
        >
          <div
            className="aboutPulseHero__field"
            aria-hidden="true"
          >
            <span className="aboutPulseHero__fieldOne" />
            <span className="aboutPulseHero__fieldTwo" />
            <span className="aboutPulseHero__fieldThree" />
            <span className="aboutPulseHero__fieldFour" />
          </div>

          <PageBackButton
            onClick={handleBack}
            placement="inside"
            label="Назад"
          />

          <motion.div
            className="aboutPulseHero__copy"
            variants={stagger}
            style={{ y: copyY }}
          >
            <motion.p
              className="aboutPulseHero__eyebrow"
              variants={reveal}
            >
              Адвокат · Разград
            </motion.p>

            <motion.h1
              id="about-pulse-title"
              variants={reveal}
            >
              Диян Данков
            </motion.h1>

            <motion.p
              className="aboutPulseHero__specialty"
              variants={reveal}
            >
              Трудови и административни спорове.
              Защита при дискриминация и произвол.
            </motion.p>

            <motion.div
              className="aboutPulseHero__actions"
              variants={reveal}
            >
              <a
                className="aboutPulseHero__primary"
                href="/kontakt#booking"
              >
                Запази консултация
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>

              <a
                className="aboutPulseHero__secondary"
                href="/novini"
              >
                Публикации
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </a>
            </motion.div>

            <motion.p
              className="aboutPulseHero__availability"
              variants={reveal}
            >
              <Clock3
                size={15}
                aria-hidden="true"
              />
              Консултации след предварително уговорен час
            </motion.p>
          </motion.div>

          <motion.div
            className="aboutPulseHero__portrait"
            style={{ y: portraitY }}
            initial={{
              opacity: 0,
              x: 54,
              scale: 0.98,
              filter: 'blur(14px)',
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            transition={{
              duration: 1.04,
              delay: 0.18,
              ease,
            }}
          >
            <div
              className="aboutPulseHero__portraitLight"
              aria-hidden="true"
            />

            <img
              src="/diyan-dankov.png"
              alt="Адвокат Диян Данков"
            />
          </motion.div>
        </motion.section>


        <motion.section
          className="aboutPulseStory"
          variants={reveal}
          aria-label="За адвокат Диян Данков"
        >
          <p>
            <span className="aboutPulseStory__name">
              Диян Данков
            </span>

            <span className="aboutPulseStory__text">
              е адвокат в Разград с практика по трудови
              и административни спорове, защита при
              дискриминация и случаи на произвол. Работата
              му започва с фактите, документите и сроковете,
              за да бъдат очертани реалните възможности и
              рискът преди да бъде предприето действие.
            </span>
          </p>
        </motion.section>

        <motion.section
          className="aboutPulseOffice"
          variants={reveal}
          aria-labelledby="about-office-title"
        >
          <div
            className="aboutPulseOffice__field"
            aria-hidden="true"
          >
            <span />
            <span />
          </div>

          <motion.div
            className="aboutPulseOffice__content"
            variants={stagger}
          >
            <motion.p
              className="aboutPulseOffice__eyebrow"
              variants={reveal}
            >
              Кантора в Разград
            </motion.p>

            <motion.h2
              id="about-office-title"
              variants={reveal}
            >
              ул. „Осъм“ 4
              <span>ет. 3 · офис 321</span>
            </motion.h2>

            <motion.div
              className="aboutPulseOffice__contacts"
              variants={reveal}
            >
              <a href="tel:+359899921629">
                <Phone
                  size={18}
                  aria-hidden="true"
                />
                <span>089 992 1629</span>
              </a>

              <a href="mailto:contact.dankov@gmail.com">
                <Mail
                  size={18}
                  aria-hidden="true"
                />
                <span>contact.dankov@gmail.com</span>
              </a>
            </motion.div>

            <motion.a
              className="aboutPulseOffice__cta"
              href="/kontakt#booking"
              variants={reveal}
            >
              Изпрати запитване
              <ArrowUpRight
                size={18}
                aria-hidden="true"
              />
            </motion.a>
          </motion.div>

          <motion.div
            className="aboutPulseOffice__map"
            variants={reveal}
          >
            <iframe
              title="Карта до кантората на адвокат Диян Данков"
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div
              className="aboutPulseOffice__mapVeil"
              aria-hidden="true"
            />

            <a
              className="aboutPulseOffice__mapLink"
              href={mapLink}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin
                size={17}
                aria-hidden="true"
              />
              Виж маршрута
            </a>
          </motion.div>
        </motion.section>
      </motion.div>
    </section>
  );
}
