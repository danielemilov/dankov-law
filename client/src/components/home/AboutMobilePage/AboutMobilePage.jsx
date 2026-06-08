import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  FileSearch,
  MapPin,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import PageBackButton from '../../PageBackButton.jsx';
import {
  fadeUp,
  pageStagger,
} from '../_shared/homeMotion.js';
import './AboutMobilePage.css';
const practiceAreas = [
  {
    number: '01',
    title: 'Трудово право',
    text:
      'Защита при уволнение, дисциплинарни производства, трудови спорове и нарушени права на работното място.',
    Icon: BriefcaseBusiness,
  },
  {
    number: '02',
    title: 'Административно право',
    text:
      'Обжалване на актове, заповеди и решения на административни органи и институции.',
    Icon: FileSearch,
  },
  {
    number: '03',
    title: 'Защита срещу дискриминация',
    text:
      'Правна оценка и защита при неравно третиране, омразна реч и посегателства срещу човешкото достойнство.',
    Icon: ShieldCheck,
  },
];
const workingPrinciples = [
  {
    title: 'Фактите преди предположенията',
    text:
      'Всеки казус започва с точна хронология, документи и ясно разграничаване на доказаното от предполагаемото.',
  },
  {
    title: 'Стратегия преди действие',
    text:
      'Следващият ход се избира според сроковете, рисковете и реалната цел на клиента, а не механично.',
  },
  {
    title: 'Ясен човешки разговор',
    text:
      'Правната материя се обяснява разбираемо, без излишно усложняване и без обещания без фактическа основа.',
  },
];
const portraitVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 28,
    filter: 'blur(14px)',
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
const floatingCardVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.94,
    filter: 'blur(8px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: 0.36,
      duration: 0.64,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
export default function AboutMobilePage({ onBack }) {
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
    window.location.assign('/');
  }
  return (
    <section
      className="aboutProfilePage"
      id="about"
      aria-labelledby="about-profile-title"
    >
      <div
        className="aboutProfilePage__ambient aboutProfilePage__ambient--one"
        aria-hidden="true"
      />
      <div
        className="aboutProfilePage__ambient aboutProfilePage__ambient--two"
        aria-hidden="true"
      />
      <div
        className="aboutProfilePage__gridTexture"
        aria-hidden="true"
      />
      <motion.div
        className="aboutProfilePage__shell"
        variants={pageStagger}
        initial="hidden"
        animate="show"
      >
        <motion.section
          className="aboutProfileHero"
          variants={fadeUp}
        >
          <PageBackButton
            onClick={handleBack}
            placement="inside"
            label="Назад"
          />
          <motion.div
            className="aboutProfileHero__portraitPanel"
            variants={portraitVariants}
          >
            <div
              className="aboutProfileHero__portraitGlow"
              aria-hidden="true"
            />
            <div
              className="aboutProfileHero__portraitGrid"
              aria-hidden="true"
            />
            <div
              className="aboutProfileHero__portraitFrame"
              aria-hidden="true"
            />
            <img
              className="aboutProfileHero__portrait"
              src="/diyan-dankov.png"
              alt="Адвокат Диян Данков"
            />
            <motion.div
              className="aboutProfileHero__portraitBadge"
              variants={floatingCardVariants}
            >
              <span>
                <Scale
                  size={16}
                  aria-hidden="true"
                />
              </span>
              <div>
                <small>Правна практика</small>
                <strong>
                  Защита с ясна позиция
                </strong>
              </div>
            </motion.div>
            <motion.div
              className="aboutProfileHero__locationBadge"
              variants={floatingCardVariants}
            >
              <MapPin
                size={15}
                aria-hidden="true"
              />
              <span>
                Разград, България
              </span>
            </motion.div>
          </motion.div>
          <motion.div
            className="aboutProfileHero__content"
            variants={pageStagger}
          >
            <motion.div
              className="aboutProfileHero__eyebrow"
              variants={fadeUp}
            >
              <span aria-hidden="true" />
              <p>
                За адвоката
              </p>
            </motion.div>
            <motion.h1
              id="about-profile-title"
              variants={fadeUp}
            >
              Диян Данков
              <span>
                Правна защита с човешки фокус.
              </span>
            </motion.h1>
            <motion.p
              className="aboutProfileHero__lead"
              variants={fadeUp}
            >
              Всеки правен казус има факти, срокове,
              документи и човешка история. Работата
              започва с внимателното им подреждане,
              ясна оценка на риска и избор на реалистичен
              следващ ход.
            </motion.p>
            <motion.div
              className="aboutProfileHero__summary"
              variants={fadeUp}
            >
              <article>
                <small>Подход</small>
                <strong>
                  Ясна оценка преди действие
                </strong>
              </article>
              <article>
                <small>Практика</small>
                <strong>
                  Права на човека и защита срещу произвол
                </strong>
              </article>
              <article>
                <small>Кантора</small>
                <strong>
                  Разград · ул. „Осъм“ 4
                </strong>
              </article>
            </motion.div>
            <motion.div
              className="aboutProfileHero__actions"
              variants={fadeUp}
            >
              <a
                className="aboutProfileHero__primary"
                href="/kontakt#booking"
              >
                <span>
                  Запази консултация
                </span>
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>
              <a
                className="aboutProfileHero__secondary"
                href="/novini"
              >
                <span>
                  Последни новини
                </span>
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </a>
            </motion.div>
          </motion.div>
        </motion.section>
        <motion.section
          className="aboutProfileStatement"
          variants={fadeUp}
          aria-labelledby="about-approach-title"
        >
          <div className="aboutProfileStatement__mark">
            <Scale
              size={25}
              aria-hidden="true"
            />
          </div>
          <div className="aboutProfileStatement__copy">
            <p>
              Подход
            </p>
            <h2 id="about-approach-title">
              Силната защита започва
              <span>
                преди съдебната зала.
              </span>
            </h2>
          </div>
          <p className="aboutProfileStatement__text">
            Преди да бъде предприета процедура, трябва да
            бъде установено какво точно се е случило, какво
            може да бъде доказано, кой срок тече и какъв
            резултат реално се търси.
          </p>
        </motion.section>
        <motion.section
          className="aboutProfilePractice"
          variants={pageStagger}
          aria-labelledby="about-practice-title"
        >
          <motion.header
            className="aboutProfilePractice__header"
            variants={fadeUp}
          >
            <div>
              <p>
                Практика
              </p>
              <h2 id="about-practice-title">
                Области на
                <span>
                  правна защита.
                </span>
              </h2>
            </div>
            <p>
              Всеки случай се разглежда според конкретните
              факти, документи и приложимите срокове.
            </p>
          </motion.header>
          <div className="aboutProfilePractice__grid">
            {practiceAreas.map(
              ({
                number,
                title,
                text,
                Icon,
              }) => (
                <motion.article
                  className="aboutProfilePractice__card"
                  variants={fadeUp}
                  key={title}
                >
                  <div className="aboutProfilePractice__cardTop">
                    <span>
                      <Icon
                        size={20}
                        aria-hidden="true"
                      />
                    </span>
                    <small>
                      {number}
                    </small>
                  </div>
                  <h3>
                    {title}
                  </h3>
                  <p>
                    {text}
                  </p>
                </motion.article>
              )
            )}
          </div>
        </motion.section>
        <motion.section
          className="aboutProfilePrinciples"
          variants={pageStagger}
          aria-labelledby="about-principles-title"
        >
          <motion.div
            className="aboutProfilePrinciples__intro"
            variants={fadeUp}
          >
            <p>
              Начин на работа
            </p>
            <h2 id="about-principles-title">
              По-малко шум.
              <span>
                Повече яснота.
              </span>
            </h2>
          </motion.div>
          <div className="aboutProfilePrinciples__list">
            {workingPrinciples.map(
              (
                {
                  title,
                  text,
                },
                index
              ) => (
                <motion.article
                  className="aboutProfilePrinciples__item"
                  variants={fadeUp}
                  key={title}
                >
                  <small>
                    0{index + 1}
                  </small>
                  <div>
                    <h3>
                      {title}
                    </h3>
                    <p>
                      {text}
                    </p>
                  </div>
                </motion.article>
              )
            )}
          </div>
        </motion.section>
        <motion.section
          className="aboutProfileOffice"
          variants={fadeUp}
          aria-labelledby="about-office-title"
        >
          <div className="aboutProfileOffice__visual">
            <div
              className="aboutProfileOffice__visualGlow"
              aria-hidden="true"
            />
            <div className="aboutProfileOffice__icon">
              <Building2
                size={28}
                aria-hidden="true"
              />
            </div>
            <span>
              Кантора
            </span>
          </div>
          <div className="aboutProfileOffice__content">
            <p>
              Среща и контакт
            </p>
            <h2 id="about-office-title">
              Разговорът започва
              <span>
                с вашия конкретен случай.
              </span>
            </h2>
            <div className="aboutProfileOffice__details">
              <div>
                <MapPin
                  size={18}
                  aria-hidden="true"
                />
                <span>
                  ул. „Осъм“ 4, ет. 3,
                  офис 321, гр. Разград
                </span>
              </div>
              <div>
                <Scale
                  size={18}
                  aria-hidden="true"
                />
                <span>
                  Консултация след предварително
                  уговорен час
                </span>
              </div>
            </div>
            <a
              href="/kontakt#booking"
              className="aboutProfileOffice__action"
            >
              <span>
                Изпрати запитване
              </span>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
              />
            </a>
          </div>
        </motion.section>
      </motion.div>
    </section>
  );
}