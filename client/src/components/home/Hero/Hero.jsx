    import { useEffect, useState } from 'react';
    import { motion } from 'framer-motion';
    import { ArrowRight } from 'lucide-react';
    import { fadeUp, HOME_REVEAL_DELAY_MS, pageStagger } from '../_shared/homeMotion.js';
    import HeroScene3D from './HeroScene3D.jsx';
    import './Hero.css';

    const heroSignals = [


      {
        label: 'Последни новини',
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

<div className="hlHero__glassPlane" aria-hidden="true">
  <span />
  <span />
</div>

<div className="hlHero__grain" />
<div className="hlHero__veil" />

            <motion.div
              className="hlHero__content"
              variants={pageStagger}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
            >
              <div className="hlHero__contentInner">
          

                <motion.h1 className="hlHero__title" variants={fadeUp}>
                  Доверието започва{' '}
                  <span>преди делото.</span>
                </motion.h1>


                <motion.div className="hlHero__actions" variants={fadeUp}>
                  <a className="hlHero__primary" href="#contact">
                    Запази консултация ↗
                  </a>

                  <a className="hlHero__link" href="#cases">
                    Последни новини ↗
                  </a>
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

        
            </div>  

           <motion.div className="hlHeroMobile__card" variants={fadeUp}>
  <HeroScene3D mode="mobileCard" />

  <span className="hlHeroMobile__cardLight" aria-hidden="true" />
  <span className="hlHeroMobile__floor" aria-hidden="true" />
  <span className="hlHeroMobile__grid" aria-hidden="true" />
  <span className="hlHeroMobile__portraitShadow" aria-hidden="true" />

  <img
    className="hlHeroMobile__portrait"
    src="/diyan-dankov.png"
    alt="Адвокат Диян Данков"
  />

  <div className="hlHeroMobile__actions">
    <a className="hlHeroMobile__cta" href="#contact">
      <span>Запази консултация</span>
    </a>

    <a className="hlHeroMobile__caseLink" href="#cases">
      <span>Последни новини</span>
      <ArrowRight size={18} strokeWidth={2} />
    </a>
  </div>
</motion.div>
          </motion.div>
          <div className="hlHeroBridge" aria-hidden="true">
  <span className="hlHeroBridge__depth" />
  <span className="hlHeroBridge__aura" />
  <span className="hlHeroBridge__line" />
  <span className="hlHeroBridge__scan" />
</div>
        </section>
      );
    }
