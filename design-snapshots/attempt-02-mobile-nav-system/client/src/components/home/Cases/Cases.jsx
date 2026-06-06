import { motion } from 'framer-motion';
import { cases } from '../_shared/homeData.js';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './Cases.css';

export default function Cases() {
  return (
    <section className="hlSection hlCases" id="cases">
      <motion.div
        variants={pageStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.16 }}
      >
        <div className="hlCases__head">
          <div>
            <motion.p className="hlKicker" variants={fadeUp}>
              Казуси и позиции
            </motion.p>
            <motion.h2 className="hlSectionTitle" variants={fadeUp}>
              Когато законът трябва да застане <em>над произвола.</em>
            </motion.h2>
          </div>

          <motion.a className="hlCases__link" href="#contact" variants={fadeUp}>
            Обсъди казус ↗
          </motion.a>
        </div>

        <div className="hlNewsGrid">
          {cases.map((item) => (
            <motion.article className="hlNewsCard" key={item.title} variants={fadeUp}>
              <a href={item.link}>
                <div className="hlNewsCard__top">
                  <time>{item.date}</time>
                  <span>{item.tag}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <strong>Прочети повече ↗</strong>
              </a>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
