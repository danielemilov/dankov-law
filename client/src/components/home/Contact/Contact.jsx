import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import BookingForm from '../../BookingForm.jsx';
import PageBackButton from '../../PageBackButton.jsx';

import {
  fadeUp,
  pageStagger,
} from '../_shared/homeMotion.js';

import './Contact.css';

export default function Contact({
  pageMode = false,
  onBack,
}) {
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

    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  }

  return (
    <section
      className={`hlSection hlContact ${pageMode ? 'hlContact--page' : ''}`}
      id="contact"
    >
      <div className="hlContact__shell">
        <div className="hlContact__grid">
          <motion.div
            className="hlContact__intro"
            variants={pageStagger}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.2,
            }}
          >
            <motion.div
              className="hlContactIntroPanel"
              variants={fadeUp}
            >
              <div className="hlContactIntroPanel__top">
                {pageMode && (
                  <PageBackButton
                    onClick={handleBack}
                    placement="inline"
                    label="Назад"
                  />
                )}

                <p className="hlKicker hlContact__kicker">
                  Свържете се
                </p>
              </div>

              <div className="hlContactIntroPanel__copy">
                <h2 className="hlSectionTitle hlContact__title">
                  Запазете{' '}
                  <em>консултация.</em>
                </h2>

                <p className="hlContactIntroPanel__summary">
                  Опишете накратко казуса си. Ще получите обратна връзка за
                  подходящ час, нужните документи и следващите стъпки.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="hlContact__detailsPanel"
              variants={fadeUp}
            >
              <div className="hlContact__details">
                <a
                  className="hlContact__detail"
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="hlContact__detailIcon">
                    <MapPin size={18} aria-hidden="true" />
                  </span>

                  <span className="hlContact__detailText">
                    <strong>Локация</strong>
                    <span>
                      ул. „Осъм“ 4, ет. 3, офис 321, гр. Разград
                    </span>
                  </span>

                  <span className="hlContact__detailArrow">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </a>

                <a
                  className="hlContact__detail"
                  href="tel:+359899921629"
                >
                  <span className="hlContact__detailIcon">
                    <Phone size={18} aria-hidden="true" />
                  </span>

                  <span className="hlContact__detailText">
                    <strong>Телефон</strong>
                    <span>089 992 1629</span>
                  </span>

                  <span className="hlContact__detailArrow">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </a>

                <a
                  className="hlContact__detail"
                  href="mailto:contact.dankov@gmail.com"
                >
                  <span className="hlContact__detailIcon">
                    <Mail size={18} aria-hidden="true" />
                  </span>

                  <span className="hlContact__detailText">
                    <strong>Email</strong>
                    <span>contact.dankov@gmail.com</span>
                  </span>

                  <span className="hlContact__detailArrow">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </a>

                <div className="hlContact__detail">
                  <span className="hlContact__detailIcon">
                    <Clock3 size={18} aria-hidden="true" />
                  </span>

                  <span className="hlContact__detailText">
                    <strong>Работно време</strong>
                    <span>Понеделник – Петък · 09:00–18:00</span>
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hlMap"
              variants={fadeUp}
            >
              <iframe
                title="Карта до кантората"
                src={mapSrc}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              <a
                className="hlMap__button"
                href={mapLink}
                target="_blank"
                rel="noreferrer"
              >
                Виж на картата
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="hlContact__formSlot"
            id="booking"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.16,
            }}
          >
            <BookingForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}