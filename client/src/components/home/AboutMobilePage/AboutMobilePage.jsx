import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, MapPin, Scale } from 'lucide-react';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './AboutMobilePage.css';

export default function AboutMobilePage({ onBack }) {
  return (
    <section className="aboutMobilePage" id="about">
      <motion.div
        className="aboutMobilePage__bar"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <button type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Към началото
        </button>
        <span>За адвоката</span>
      </motion.div>

      <motion.div
        className="aboutMobilePage__shell"
        variants={pageStagger}
        initial="hidden"
        animate="show"
      >
        <motion.div className="aboutMobilePage__hero" variants={fadeUp}>
          <div className="aboutMobilePage__portrait">
            <img src="/diyan-dankov.png" alt="Адвокат Диян Данков" />
          </div>

          <p>Адвокат · Разград · права на човека</p>
          <h1>
            Диян Данков
            <span>правна защита с човешки фокус.</span>
          </h1>
        </motion.div>

        <motion.div className="aboutMobilePage__statement" variants={fadeUp}>
          <Scale size={22} />
          <p>
            Работата започва с ясно подреждане на фактите: какво се е случило,
            кога, какъв документ е получен и какъв срок тече.
          </p>
        </motion.div>

        <motion.div className="aboutMobilePage__cards" variants={fadeUp}>
          <article>
            <BriefcaseBusiness size={19} />
            <strong>Практика</strong>
            <span>Трудово, административно право, дискриминация и защита срещу произвол.</span>
          </article>
          <article>
            <MapPin size={19} />
            <strong>Кантора</strong>
            <span>ул. "Осъм" 4, ет. 3, офис 321, гр. Разград.</span>
          </article>
        </motion.div>

      <motion.div className="aboutMobilePage__actions" variants={fadeUp}>
  <a href="/#booking">
    Запази консултация
    <ArrowUpRight size={18} />
  </a>

  <a href="/novini">
    Всички новини
    <ArrowUpRight size={18} />
  </a>
</motion.div>
      </motion.div>
    </section>
  );
}
