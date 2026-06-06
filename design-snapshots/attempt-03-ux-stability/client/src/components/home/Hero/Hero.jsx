import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { videos } from '../_shared/homeData.js';
import {
  fadeUp,
  HOME_REVEAL_DELAY_MS,
  pageStagger,
  VIDEO_DURATION_MS,
} from '../_shared/homeMotion.js';
import './Hero.css';

export default function Hero() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const activeVideo = videos[active];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
    }, HOME_REVEAL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (paused) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % videos.length);
    }, VIDEO_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    setVideoReady(false);
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (paused) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [paused, active]);

  const setVideoStart = () => {
    const video = videoRef.current;
    if (!video || Number.isNaN(video.duration)) return;

    const start = activeVideo.startAt || 0;
    const safeStart = Math.min(start, Math.max(video.duration - 0.5, 0));

    try {
      video.currentTime = safeStart;
    } catch {
      // Safari sometimes blocks currentTime before metadata is fully ready.
    }
  };

  const handleVideoReady = () => {
    setVideoStart();
    setVideoReady(true);

    if (!paused) {
      videoRef.current?.play().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoStart();

    if (!paused) {
      video.play().catch(() => {});
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || paused) return;

    const end = activeVideo.endAt;

    if (typeof end !== 'number') return;

    if (video.currentTime >= end) {
      setActive((current) => (current + 1) % videos.length);
    }
  };

  return (
    <section className="hlHero" id="home">
      <div className="hlHero__noise" />
      <div className="hlHero__ambient" />
      <div className="hlHero__joiner" />
      <div className="hlHero__joinerFine" />

      <motion.div
        className="hlHero__content"
        variants={pageStagger}
        initial="hidden"
        animate={ready ? 'show' : 'hidden'}
      >
        <div className="hlHero__contentInner">
          <motion.p className="hlKicker hlHero__kicker" variants={fadeUp}>
            Адвокат · Разград · права на човека
          </motion.p>

          <AnimatedHeroTitle
            key={activeVideo.headline.join('-')}
            lines={activeVideo.headline}
            ready={ready}
          />

          <motion.p
            key={activeVideo.lead}
            className="hlHero__lead"
            variants={fadeUp}
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
          >
            {activeVideo.lead}
          </motion.p>

          <motion.div className="hlHero__actions" variants={fadeUp}>
            <a
              className="hlHero__link"
              href={activeVideo.youtubeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Гледай цялото видео ↗
            </a>

            <a className="hlHero__link" href="#contact">
              Запази консултация ↗
            </a>
          </motion.div>

          <motion.div className="hlHero__controls" variants={fadeUp}>
            <button
              className="hlHero__pause"
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? 'Пусни видеото' : 'Пауза на видеото'}
            >
              {paused ? '▶' : 'Ⅱ'}
            </button>

            <div className="hlHero__dots" aria-label="Избор на видео">
              {videos.map((video, index) => (
                <button
                  key={video.src}
                  type="button"
                  className={index === active ? 'is-active' : ''}
                  onClick={() => {
                    setActive(index);
                    setPaused(false);
                  }}
                  aria-label={`Видео ${index + 1}: ${video.label}`}
                />
              ))}
            </div>

            <motion.span
              className="hlHero__videoName"
              key={activeVideo.label}
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeVideo.label}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      <motion.aside
        className="hlHero__videoStage"
        id="video"
        initial={{
          opacity: 0,
          x: 54,
          filter: 'blur(20px)',
        }}
        animate={
          ready
            ? {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
              }
            : {
                opacity: 0,
                x: 54,
                filter: 'blur(20px)',
              }
        }
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className={`hlHero__videoLoading ${videoReady ? 'is-hidden' : ''}`}>
          <span />
        </div>

        <div className="hlHero__videoShape">
          <AnimatePresence mode="wait">
            <motion.video
              key={activeVideo.src}
              ref={videoRef}
              className={`hlHero__video ${videoReady ? 'is-ready' : ''}`}
              style={{
                objectPosition: activeVideo.objectPosition || 'center center',
              }}
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleVideoReady}
              onCanPlay={() => setVideoReady(true)}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              initial={{ opacity: 0, scale: 1.08, filter: 'blur(18px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <source src={activeVideo.src} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
        </div>

        <div className="hlHero__videoVeil" />
      </motion.aside>
    </section>
  );
}

function AnimatedHeroTitle({ lines, ready }) {
  return (
    <h1 className="hlHero__title">
      {lines.map((line, lineIndex) => (
        <span className="hlHero__titleLine" key={line}>
          {line.split(' ').map((word, wordIndex) => (
            <span className="hlHero__wordMask" key={`${line}-${word}-${wordIndex}`}>
              <motion.span
                className="hlHero__word"
                initial={{
                  y: '112%',
                  opacity: 0,
                  rotateX: -12,
                  filter: 'blur(10px)',
                }}
                animate={
                  ready
                    ? {
                        y: '0%',
                        opacity: 1,
                        rotateX: 0,
                        filter: 'blur(0px)',
                      }
                    : {
                        y: '112%',
                        opacity: 0,
                        rotateX: -12,
                        filter: 'blur(10px)',
                      }
                }
                transition={{
                  delay: lineIndex * 1.16 + wordIndex * 0.085,
                  duration: 0.82,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
                {wordIndex < line.split(' ').length - 1 ? '\u00A0' : ''}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
