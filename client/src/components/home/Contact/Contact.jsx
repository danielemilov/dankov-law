import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BookingForm from '../../BookingForm.jsx';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './Contact.css';

export default function Contact({ pageMode = false, onBack }) {
  const mapQuery = encodeURIComponent('ул. Осъм 4, ет. 3, офис 321, Разград 7200, България');
  const mapSrc = `https://maps.google.com/maps?hl=bg&q=${mapQuery}&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className={`hlSection hlContact ${pageMode ? 'hlContact--page' : ''}`} id="contact">
      {pageMode && (
        <motion.div
          className="hlContactPageBar"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <button type="button" onClick={onBack}>
            <ArrowLeft size={18} />
            Назад
          </button>
          <span>Контакт</span>
        </motion.div>
      )}

      <div className="hlContact__grid">
        <motion.div
          className="hlContact__intro"
          variants={pageStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.p className="hlKicker" variants={fadeUp}>
            Свържете се
          </motion.p>

          <motion.h2 className="hlSectionTitle" variants={fadeUp}>
            Запазете <em>консултация.</em>
          </motion.h2>

          <motion.p className="hlContact__lead" variants={fadeUp}>
            Опишете казуса накратко. Заявката се записва сигурно и се изпраща
            към кантората за обратна връзка.
          </motion.p>

          <motion.div className="hlContact__details" variants={fadeUp}>
            <p>
              <strong>Локация</strong>
              <span>ул. "Осъм" 4, ет. 3, офис 321, гр. Разград</span>
            </p>
            <p>
              <strong>Email</strong>
              <span>contact.dankov@gmail.com</span>
            </p>
            <p>
              <strong>Работно време</strong>
              <span>Понеделник – Петък · 09:00–18:00</span>
            </p>
          </motion.div>

          <motion.div className="hlMap" variants={fadeUp}>
            <iframe
              title="Карта до кантората"
              src={mapSrc}
              loading="eager"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>

        <BookingForm />
      </div>
    </section>
  );
}
