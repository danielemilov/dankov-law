import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, HOME_REVEAL_DELAY_MS, pageStagger } from '../_shared/homeMotion.js';
import HeroScene3D from './HeroScene3D.jsx';
import './Hero.css';

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
      <HeroScene3D />

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

            <a className="hlHero__link" href="#about">
              Виж подхода ↗
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
        initial={{ opacity: 0, y: 54, scale: 0.96, filter: 'blur(18px)' }}
        animate={
          ready
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, y: 54, scale: 0.96, filter: 'blur(18px)' }
        }
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hlHero__portraitGlass">
          <span />
          <span />
        </div>

        <div className="hlHero__identityCard">
          <small>Адвокат</small>
          <strong>Диян Данков</strong>
          <span>Правна защита с човешки фокус.</span>
        </div>

        <div className="hlHero__signal hlHero__signal--one">
          <small>Сигурност</small>
          <strong>План преди ход</strong>
        </div>

        <div className="hlHero__signal hlHero__signal--two">
          <small>Позиция</small>
          <strong>Правата имат глас</strong>
        </div>

        <img src="/diyan-dankov.png" alt="Адвокат Диян Данков" />
      </motion.div>
    </section>
  );
}
