export const HOME_REVEAL_DELAY_MS = 320;
export const VIDEO_DURATION_MS = 25000;

export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(12px)',
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.82,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const pageStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};
