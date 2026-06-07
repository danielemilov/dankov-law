import { motion } from 'framer-motion';
import { attorneyBubbles } from '../_shared/homeData.js';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './AttorneyCinematic.css';

export default function AttorneyCinematic() {
  return (
    <section id="about" className="attorneyCinematic">
      <div className="attorneyCinematic__noise" />
      <div className="attorneyCinematic__orb attorneyCinematic__orb--one" />
      <div className="attorneyCinematic__orb attorneyCinematic__orb--two" />
      <div className="attorneyCinematic__orb attorneyCinematic__orb--three" />

      <motion.div
        className="attorneyCinematic__copy"
        variants={pageStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.24 }}
      >
        <motion.p className="attorneyCinematic__eyebrow" variants={fadeUp}>
          За адвоката
        </motion.p>

        <motion.h2 variants={fadeUp}>
          Защитата започва
          <span>преди делото.</span>
        </motion.h2>

        <motion.p className="attorneyCinematic__lead" variants={fadeUp}>
          Преди всяка правна процедура стои човек — с притеснение, казус,
          история и нужда от ясна позиция. Работата на адв. Диян Данков
          съчетава човешки подход, стратегия и защита срещу произвол.
        </motion.p>

        <motion.div className="attorneyCinematic__actions" variants={fadeUp}>
          <a href="#contact">Запази консултация ↗</a>
          <a href="#cases">Последни новини ↗</a>
        </motion.div>
      </motion.div>

      <motion.div
        className="attorneyCinematic__visual"
        initial={{ opacity: 0, y: 70, scale: 0.96, filter: 'blur(18px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="attorneyCinematic__portal">
          <span />
          <span />
          <span />
        </div>

        <div className="attorneyCinematic__ring attorneyCinematic__ring--one" />
        <div className="attorneyCinematic__ring attorneyCinematic__ring--two" />

        {attorneyBubbles.map((bubble, index) => (
          <motion.div
            className={`attorneyCinematic__bubble attorneyCinematic__bubble--${index + 1}`}
            key={bubble.text}
            initial={{ opacity: 0, scale: 0.84, y: 18, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: 0.22 + index * 0.12,
              duration: 0.72,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="attorneyCinematic__bubbleLine" aria-hidden="true" />
            <span className="attorneyCinematic__bubbleDot" aria-hidden="true" />
            <span className="attorneyCinematic__bubbleCopy">
              <small>{bubble.number}</small>
              <strong>{bubble.text}</strong>
            </span>
          </motion.div>
        ))}

        <div className="attorneyCinematic__identity">
          <small>Адвокат</small>
          <strong>Диян Данков</strong>
          <span>Правна защита с човешки фокус.</span>
        </div>

        <img src="/diyan-dankov.png" alt="Адвокат Диян Данков" />
      </motion.div>
    </section>
  );
}
