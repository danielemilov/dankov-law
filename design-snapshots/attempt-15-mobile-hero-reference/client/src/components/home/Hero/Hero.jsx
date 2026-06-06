import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { fadeUp, HOME_REVEAL_DELAY_MS, pageStagger } from '../_shared/homeMotion.js';
import HeroScene3D from './HeroScene3D.jsx';
import './Hero.css';

const heroSignals = [
  {
    label: 'Оценка на случая',
    href: '#contact',
    Icon: ShieldCheck,
    type: 'info',
  },
  {
    label: 'Правна позиция',
    href: '#contact',
    Icon: FileText,
    type: 'info',
  },
  {
    label: 'Виж казуси',
    href: '#cases',
    Icon: ArrowRight,
    type: 'action',
  },
];

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
    }, HOME_REVEAL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hlHero" id="home">
      <div className="hlHero__desktopScene">
        <HeroScene3D mode="desktop" />

        <div className="hlHero__grain" />
        <div className="hlHero__veil" />

        <motion.div
          className="hlHero__content"
          variants={pageStagger}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
        >
          <div className="hlHero__contentInner">
            <motion.p className="hlKicker hlHero__kicker" variants={fadeUp}>
              Адвокат · Разград · стратегическа защита
            </motion.p>

            <motion.h1 className="hlHero__title" variants={fadeUp}>
              Защитата започва{' '}
              <span>преди делото.</span>
            </motion.h1>

            <motion.p className="hlHero__lead" variants={fadeUp}>
              Премерен подход, ясна позиция и правна стратегия, когато човек има
              нужда от спокойствие, сигурност и уверена защита срещу произвол.
            </motion.p>

            <motion.div className="hlHero__actions" variants={fadeUp}>
              <a className="hlHero__primary" href="#contact">
                Запази консултация ↗
              </a>

              <a className="hlHero__link" href="#cases">
                Виж казуси ↗
              </a>
            </motion.div>

            <motion.div className="hlHero__trust" variants={fadeUp}>
              <article>
                <small>01</small>
                <strong>Ранна стратегия</strong>
              </article>
              <article>
                <small>02</small>
                <strong>Ясна оценка</strong>
              </article>
              <article>
                <small>03</small>
                <strong>Действие без шум</strong>
              </article>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="hlHero__portraitStage"
          initial={{ opacity: 0, y: 28, scale: 0.985, filter: 'blur(5px)' }}
          animate={
            ready
              ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, y: 28, scale: 0.985, filter: 'blur(5px)' }
          }
          transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hlHero__portraitGlass">
            <span />
            <span />
          </div>

          <img src="/diyan-dankov.png" alt="Адвокат Диян Данков" />
        </motion.div>
      </div>

      <motion.div
        className="hlHeroMobile"
        variants={pageStagger}
        initial="hidden"
        animate={ready ? 'show' : 'hidden'}
      >
        <div className="hlHeroMobile__grain" />

        <div className="hlHeroMobile__copy">
          <motion.h1 className="hlHeroMobile__title" variants={fadeUp}>
            <span className="hlHeroMobile__titleMain">Защитата започва</span>
            <span className="hlHeroMobile__titleMuted">преди делото.</span>
          </motion.h1>

          <motion.p className="hlHeroMobile__lead" variants={fadeUp}>
            Премерен подход, ясна позиция и навременна стратегия, които носят
            спокойствие, сигурност и резултат.
          </motion.p>
        </div>

        <motion.div className="hlHeroMobile__card" variants={fadeUp}>
          <HeroScene3D mode="mobileCard" />

          <span className="hlHeroMobile__cardLight" aria-hidden="true" />
          <span className="hlHeroMobile__floor" aria-hidden="true" />
          <span className="hlHeroMobile__grid" aria-hidden="true" />
          <span className="hlHeroMobile__portraitShadow" aria-hidden="true" />

          <img className="hlHeroMobile__portrait" src="/diyan-dankov.png" alt="Адвокат Диян Данков" />

          <div className="hlHeroMobile__signalStack" aria-label="Ключови действия">
            {heroSignals.map(({ label, href, Icon, type }) => (
              <a className={`hlHeroMobile__signalCard hlHeroMobile__signalCard--${type}`} href={href} key={label}>
                <Icon size={type === 'action' ? 23 : 22} strokeWidth={type === 'action' ? 2 : 1.8} />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <div className="hlHeroMobile__actions">
            <a className="hlHeroMobile__cta" href="#contact">
              <span>Запази консултация</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
