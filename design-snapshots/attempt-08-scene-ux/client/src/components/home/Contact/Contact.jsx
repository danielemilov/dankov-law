import { motion } from 'framer-motion';
import BookingForm from '../../BookingForm.jsx';
import { fadeUp, pageStagger } from '../_shared/homeMotion.js';
import './Contact.css';

export default function Contact() {
  const mapQuery = encodeURIComponent('Разград България адвокатска кантора');

  return (
    <section className="hlSection hlContact" id="contact">
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
              <span>Разград, България</span>
            </p>
            <p>
              <strong>Email</strong>
              <span>office@dankov-law.bg</span>
            </p>
            <p>
              <strong>Работно време</strong>
              <span>Понеделник – Петък · 09:00–18:00</span>
            </p>
          </motion.div>

          <motion.div className="hlMap" variants={fadeUp}>
            <iframe
              title="Карта до кантората"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>

        <BookingForm />
      </div>
    </section>
  );
}
