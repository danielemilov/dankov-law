import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const SHOW_MS = 1750;
const EXIT_MS = 1750;

export default function BrandIntroLoader({
  enabled = true,
  oncePerSession = false,
  storageKey = 'dankov_center_intro_seen_v5',
  imageSrc = '/diyan-dankovv.jpg',
}) {
  const [mounted, setMounted] = useState(() => {
    if (!enabled) return false;

    if (
      oncePerSession &&
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(storageKey) === 'yes'
    ) {
      return false;
    }

    return true;
  });

  const [phase, setPhase] = useState('enter');
  const [imageOk, setImageOk] = useState(Boolean(imageSrc));

  useEffect(() => {
    if (!mounted) return undefined;

    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, SHOW_MS);

    const removeTimer = window.setTimeout(() => {
      if (oncePerSession) {
        window.sessionStorage.setItem(storageKey, 'yes');
      }

      setMounted(false);
    }, SHOW_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [mounted, oncePerSession, storageKey]);

  const isExit = phase === 'exit';

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          className={`ddIntro ${isExit ? 'ddIntro--exit' : ''}`}
          initial={{
            opacity: 0,
            backdropFilter: 'blur(0px) saturate(1)',
          }}
          animate={
            isExit
              ? {
                  opacity: [1, 1, 0.92, 0],
                  backdropFilter: [
                    'blur(18px) saturate(1.18)',
                    'blur(22px) saturate(1.25)',
                    'blur(9px) saturate(1.08)',
                    'blur(0px) saturate(1)',
                  ],
                }
              : {
                  opacity: 1,
                  backdropFilter: 'blur(18px) saturate(1.18)',
                }
          }
          transition={
            isExit
              ? {
                  duration: 1.65,
                  times: [0, 0.34, 0.72, 1],
                  ease: [0.16, 1, 0.3, 1],
                }
              : {
                  duration: 0.46,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
        >
          <style>{css}</style>

          <motion.div
            className="ddIntro__glassClear"
            animate={
              isExit
                ? {
                    opacity: [0, 0.48, 0.32, 0],
                    scale: [0.88, 1.05, 1.28, 1.55],
                    filter: ['blur(22px)', 'blur(10px)', 'blur(4px)', 'blur(0px)'],
                  }
                : {
                    opacity: 0,
                    scale: 0.88,
                  }
            }
            transition={{
              duration: 1.45,
              times: [0, 0.36, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          <motion.div
            className="ddIntro__cinematicSweep"
            animate={
              isExit
                ? {
                    x: ['-150%', '145%'],
                    opacity: [0, 0.9, 0],
                  }
                : {
                    x: '-150%',
                    opacity: 0,
                  }
            }
            transition={{
              duration: 1.1,
              ease: [0.76, 0, 0.24, 1],
            }}
          />

          <motion.div
            className="ddIntro__lensRing"
            animate={
              isExit
                ? {
                    opacity: [0, 0.42, 0],
                    scale: [0.76, 1.18, 1.8],
                    filter: ['blur(8px)', 'blur(2px)', 'blur(18px)'],
                  }
                : {
                    opacity: 0,
                    scale: 0.76,
                  }
            }
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          <motion.div
            className="ddIntro__card"
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.94,
              rotateX: -8,
              filter: 'blur(14px)',
              clipPath: 'inset(0% 0% 0% 0% round 999px)',
            }}
            animate={
              isExit
                ? {
                    opacity: [1, 0.98, 0.72, 0.28, 0],
                    y: [0, -3, -5, -8, -12],
                    scale: [1, 1.018, 1.006, 0.975, 0.94],
                    rotateX: [0, 0, 3, 7, 9],
                    filter: [
                      'blur(0px)',
                      'blur(0px)',
                      'blur(3px)',
                      'blur(10px)',
                      'blur(18px)',
                    ],
                    clipPath: [
                      'inset(0% 0% 0% 0% round 999px)',
                      'inset(0% 0% 0% 0% round 999px)',
                      'inset(7% 12% 7% 12% round 999px)',
                      'inset(18% 38% 18% 38% round 999px)',
                      'inset(18% -35% 18% 125% round 999px)',
                    ],
                  }
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    filter: 'blur(0px)',
                    clipPath: 'inset(0% 0% 0% 0% round 999px)',
                  }
            }
            transition={
              isExit
                ? {
                    duration: 1.45,
                    times: [0, 0.24, 0.52, 0.78, 1],
                    ease: [0.16, 1, 0.3, 1],
                  }
                : {
                    duration: 0.66,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
          >
            <motion.div
              className="ddIntro__innerGlass"
              animate={
                isExit
                  ? {
                      opacity: [0, 0.72, 0],
                      x: ['-42%', '22%', '78%'],
                    }
                  : {
                      opacity: 0,
                      x: '-42%',
                    }
              }
              transition={{
                duration: 1.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            />

            <motion.div
              className="ddIntro__beam"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                isExit
                  ? {
                      scaleX: [1, 1, 0],
                      opacity: [1, 0.72, 0],
                    }
                  : {
                      scaleX: 1,
                      opacity: 1,
                    }
              }
              transition={
                isExit
                  ? {
                      duration: 0.85,
                      times: [0, 0.42, 1],
                      ease: [0.4, 0, 1, 1],
                    }
                  : {
                      delay: 0.14,
                      duration: 0.76,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            />

            <motion.div
              className="ddIntro__portraitWrap"
              initial={{
                x: -20,
                opacity: 0,
                scale: 0.84,
                filter: 'blur(10px)',
              }}
              animate={
                isExit
                  ? {
                      x: [0, -4, -16, -30],
                      opacity: [1, 0.88, 0.42, 0],
                      scale: [1, 0.96, 0.86, 0.72],
                      filter: ['blur(0px)', 'blur(1px)', 'blur(6px)', 'blur(16px)'],
                    }
                  : {
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      filter: 'blur(0px)',
                    }
              }
              transition={
                isExit
                  ? {
                      duration: 0.9,
                      times: [0, 0.34, 0.7, 1],
                      ease: [0.4, 0, 1, 1],
                    }
                  : {
                      delay: 0.12,
                      duration: 0.58,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            >
              <div className="ddIntro__portraitGlow" />

              <div className="ddIntro__portrait">
                {imageOk ? (
                  <img
                    src={imageSrc}
                    alt="Диян Данков"
                    onError={() => setImageOk(false)}
                  />
                ) : (
                  <span>ДД</span>
                )}
              </div>
            </motion.div>

            <motion.div
              className="ddIntro__copy"
              animate={
                isExit
                  ? {
                      opacity: [1, 1, 0.44, 0],
                      y: [0, -3, -10, -22],
                      filter: ['blur(0px)', 'blur(0px)', 'blur(6px)', 'blur(18px)'],
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                    }
              }
              transition={
                isExit
                  ? {
                      duration: 0.95,
                      times: [0, 0.36, 0.72, 1],
                      ease: [0.4, 0, 1, 1],
                    }
                  : {
                      duration: 0.2,
                    }
              }
            >
              <motion.p
                className="ddIntro__kicker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.24,
                  duration: 0.34,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Адвокат · Разград
              </motion.p>

              <WordReveal text="Диян Данков" delay={0.32} />

              <motion.p
                className="ddIntro__line"
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 0.7,
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Правна защита с човешки фокус.
              </motion.p>
            </motion.div>

            <motion.div
              className="ddIntro__progress"
              initial={{ opacity: 0 }}
              animate={
                isExit
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 1,
                    }
              }
              transition={{ delay: 0.72, duration: 0.2 }}
            >
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.78,
                  duration: 1.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WordReveal({ text, delay = 0 }) {
  const words = String(text).split(' ');

  return (
    <h1 className="ddIntro__title">
      {words.map((word, index) => (
        <span className="ddIntro__wordMask" key={`${word}-${index}`}>
          <motion.span
            className="ddIntro__word"
            initial={{
              y: '112%',
              opacity: 0,
              rotateX: -16,
              filter: 'blur(8px)',
            }}
            animate={{
              y: '0%',
              opacity: 1,
              rotateX: 0,
              filter: 'blur(0px)',
            }}
            transition={{
              delay: delay + index * 0.075,
              duration: 0.52,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {index < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

const css = `
.ddIntro {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: grid;
  place-items: center;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 46%, rgba(247, 250, 240, 0.24), transparent 31%),
    linear-gradient(120deg, rgba(17, 22, 17, 0.1), rgba(17, 22, 17, 0.032));
  isolation: isolate;
}

.ddIntro::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(183, 255, 47, 0.12), transparent 34%),
    radial-gradient(circle at 82% 20%, rgba(216, 255, 117, 0.1), transparent 32%),
    rgba(247, 250, 240, 0.1);
  pointer-events: none;
}

.ddIntro::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.07;
  mix-blend-mode: multiply;
  background-image:
    linear-gradient(rgba(17, 22, 17, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 22, 17, 0.055) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(circle at center, #000, transparent 74%);
}

.ddIntro__glassClear {
  position: absolute;
  z-index: 4;
  width: min(620px, calc(100vw - 30px));
  height: 240px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.78), rgba(247, 250, 240, 0.26) 42%, transparent 72%);
  pointer-events: none;
}

.ddIntro__cinematicSweep {
  position: absolute;
  top: -24%;
  bottom: -24%;
  width: 40vw;
  z-index: 7;
  pointer-events: none;
  background:
    linear-gradient(
      100deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 30%,
      rgba(255, 255, 255, 0.4) 43%,
      rgba(183, 255, 47, 0.32) 50%,
      rgba(255, 255, 255, 0.26) 58%,
      transparent 100%
    );
  filter: blur(12px);
  transform: skewX(-14deg);
}

.ddIntro__lensRing {
  position: absolute;
  z-index: 8;
  width: min(540px, calc(100vw - 34px));
  height: 154px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.44);
  box-shadow:
    0 0 58px rgba(255, 255, 255, 0.22),
    0 0 88px rgba(183, 255, 47, 0.14),
    inset 0 0 40px rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.ddIntro__card {
  position: relative;
  z-index: 10;
  width: min(492px, calc(100vw - 36px));
  min-height: 132px;
  display: grid;
  grid-template-columns: 82px 1fr;
  column-gap: 18px;
  align-items: center;
  padding: 18px 22px 19px;
  overflow: hidden;
  border-radius: 999px;
  color: #111611;
  background:
    linear-gradient(118deg, rgba(255, 255, 255, 0.74), rgba(247, 250, 240, 0.46)),
    radial-gradient(circle at 12% 18%, rgba(183, 255, 47, 0.28), transparent 36%),
    radial-gradient(circle at 94% 0%, rgba(216, 255, 117, 0.22), transparent 36%);
  border: 1px solid rgba(255, 255, 255, 0.66);
  box-shadow:
    0 36px 110px rgba(17, 22, 17, 0.18),
    0 16px 48px rgba(17, 22, 17, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.74),
    inset 0 -1px 0 rgba(17, 22, 17, 0.06);
  backdrop-filter: blur(32px) saturate(1.38);
  transform-style: preserve-3d;
}

.ddIntro__card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    linear-gradient(108deg, rgba(183, 255, 47, 0.22) 0 20%, transparent 20% 100%),
    linear-gradient(108deg, transparent 0 74%, rgba(17, 22, 17, 0.028) 74.2%, transparent 74.7% 100%);
  opacity: 0.82;
  pointer-events: none;
}

.ddIntro__card::after {
  content: '';
  position: absolute;
  inset: -60% -35%;
  z-index: 1;
  border-radius: inherit;
  background:
    linear-gradient(100deg, transparent 0 43%, rgba(255, 255, 255, 0.5) 50%, transparent 57% 100%);
  transform: translateX(-46%);
  animation: ddIntroShine 1.45s ease-in-out 0.22s both;
  pointer-events: none;
}

.ddIntro__innerGlass {
  position: absolute;
  inset: -40%;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(100deg, transparent 0 42%, rgba(255, 255, 255, 0.5) 50%, transparent 58% 100%);
  filter: blur(8px);
}

.ddIntro__beam {
  position: absolute;
  left: 104px;
  right: 28px;
  bottom: 20px;
  height: 2px;
  z-index: 4;
  border-radius: 999px;
  background: linear-gradient(90deg, #111611, #b7ff2f, #d8ff75, transparent);
  transform-origin: left;
}

.ddIntro__portraitWrap {
  position: relative;
  z-index: 3;
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
}

.ddIntro__portraitGlow {
  position: absolute;
  inset: -13px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(183, 255, 47, 0.36), transparent 62%);
  filter: blur(10px);
}

.ddIntro__portrait {
  position: relative;
  width: 72px;
  height: 72px;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle at 34% 22%, rgba(255, 255, 255, 0.52), transparent 28%),
    #111611;
  border: 1.5px solid rgba(183, 255, 47, 0.82);
  box-shadow:
    0 18px 42px rgba(17, 22, 17, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.ddIntro__portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ddIntro__portrait span {
  color: #b7ff2f;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.09em;
}

.ddIntro__copy {
  position: relative;
  z-index: 3;
  min-width: 0;
  padding-bottom: 10px;
}

.ddIntro__kicker {
  margin: 0 0 7px;
  color: rgba(17, 22, 17, 0.56);
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.ddIntro__title {
  margin: 0;
  color: #111611;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 35px;
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.076em;
}

.ddIntro__wordMask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}

.ddIntro__word {
  display: inline-block;
  transform-origin: 50% 100%;
}

.ddIntro__line {
  margin: 8px 0 0;
  color: rgba(17, 22, 17, 0.68);
  font-size: 13.5px;
  line-height: 1.32;
  letter-spacing: -0.025em;
}

.ddIntro__progress {
  position: absolute;
  left: 104px;
  right: 28px;
  bottom: 20px;
  z-index: 4;
  height: 2px;
  overflow: hidden;
  background: rgba(17, 22, 17, 0.07);
  border-radius: 999px;
}

.ddIntro__progress span {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #111611, #b7ff2f, #d8ff75);
  transform-origin: left;
  border-radius: inherit;
}

@keyframes ddIntroShine {
  0% {
    transform: translateX(-48%);
    opacity: 0;
  }

  28% {
    opacity: 0.68;
  }

  100% {
    transform: translateX(38%);
    opacity: 0;
  }
}

@media (max-width: 720px) {
  .ddIntro__card {
    width: calc(100vw - 32px);
    min-height: 112px;
    grid-template-columns: 62px 1fr;
    column-gap: 13px;
    padding: 14px 16px 16px;
    border-radius: 28px;
  }

  .ddIntro__portraitWrap {
    width: 62px;
    height: 62px;
  }

  .ddIntro__portrait {
    width: 56px;
    height: 56px;
  }

  .ddIntro__title {
    font-size: 28px;
  }

  .ddIntro__line {
    font-size: 12.7px;
  }

  .ddIntro__beam,
  .ddIntro__progress {
    left: 90px;
    right: 18px;
    bottom: 13px;
  }
}
`;