import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, FileText, Scale, ShieldCheck } from 'lucide-react';
import { fadeUp, HOME_REVEAL_DELAY_MS, pageStagger } from '../_shared/homeMotion.js';
import HeroScene3D from './HeroScene3D.jsx';
import './Hero.css';

const heroSignals = [
  {
    label: 'Оценка на случая',
    href: '#contact',
    Icon: ShieldCheck,
  },
  {
    label: 'Правна позиция',
    href: '#contact',
    Icon: FileText,
  },
  {
    label: 'Виж казуси',
    href: '#cases',
    Icon: Scale,
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
      <div className="hlHero__grain" />
      <div className="hlHero__veil" />
      <div className="hlHero__ambient" />

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
            Защитата започва
            <span>преди делото.</span>
          </motion.h1>

          <motion.span className="hlHero__rule" variants={fadeUp} />

          <motion.p className="hlHero__lead" variants={fadeUp}>
            Премерен подход, ясна позиция и навременна правна стратегия,
            когато имате нужда от спокойствие, сигурност и резултат.
          </motion.p>

          <motion.div className="hlHero__actions" variants={fadeUp}>
            <a className="hlHero__primary" href="#contact">
              <CalendarDays size={18} strokeWidth={2.1} />
              <span>Запази консултация</span>
              <ArrowRight size={18} strokeWidth={2.3} />
            </a>

            <a className="hlHero__link" href="#cases">
              <span>Виж казуси</span>
              <ArrowRight size={18} strokeWidth={2.3} />
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="hlHero__visual"
        initial={{ opacity: 0, y: 32, scale: 0.985, filter: 'blur(10px)' }}
        animate={
          ready
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, y: 32, scale: 0.985, filter: 'blur(10px)' }
        }
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hlHero__portraitCard">
          <HeroScene3D />

          <span className="hlHero__cardLight hlHero__cardLight--top" aria-hidden="true" />
          <span className="hlHero__cardLight hlHero__cardLight--floor" aria-hidden="true" />
          <span className="hlHero__cardGrid" aria-hidden="true" />
          <span className="hlHero__portraitShadow" aria-hidden="true" />

          <img className="hlHero__portrait" src="/diyan-dankov.png" alt="Адвокат Диян Данков" />

          <div className="hlHero__signalStack" aria-label="Ключови действия">
            {heroSignals.map(({ label, href, Icon }) => (
              <a className="hlHero__signalCard" href={href} key={label}>
                <Icon size={24} strokeWidth={1.75} />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <div className="hlHero__visualActions">
            <a className="hlHero__visualCta" href="#contact">
              <CalendarDays size={22} strokeWidth={1.8} />
              <span>Запази консултация</span>
              <ArrowRight size={24} strokeWidth={2.05} />
            </a>

            <a className="hlHero__visualLink" href="#cases">
              <span>Виж казуси</span>
              <ArrowRight size={22} strokeWidth={2.05} />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
