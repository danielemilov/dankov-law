import {
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const POSITIONS_STORAGE_KEY =
  'dankov-law:scroll-positions:v2';

const LAST_NAVIGATION_KEY =
  'dankov-law:last-internal-navigation:v2';

const MAX_RESTORE_ATTEMPTS = 100;

function getRouteKey(location) {
  return `${location.pathname}${location.search}`;
}

function getFullPath(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function readPositions() {
  try {
    const stored = window.sessionStorage.getItem(
      POSITIONS_STORAGE_KEY
    );

    if (!stored) return {};

    const parsed = JSON.parse(stored);

    return parsed && typeof parsed === 'object'
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writePositions(positions) {
  try {
    window.sessionStorage.setItem(
      POSITIONS_STORAGE_KEY,
      JSON.stringify(positions)
    );
  } catch {
    // Продължаваме без sessionStorage.
  }
}

function savePosition(routeKey, x, y) {
  if (!routeKey) return;

  const positions = readPositions();

  positions[routeKey] = {
    x: Math.max(0, Number(x) || 0),
    y: Math.max(0, Number(y) || 0),
  };

  writePositions(positions);
}

function readPosition(routeKey) {
  const positions = readPositions();
  const position = positions[routeKey];

  if (
    !position ||
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y)
  ) {
    return null;
  }

  return position;
}

function saveNavigationOrigin({ from, to, scrollY }) {
  try {
    window.sessionStorage.setItem(
      LAST_NAVIGATION_KEY,
      JSON.stringify({
        from,
        to,
        scrollY: Math.max(0, Number(scrollY) || 0),
        savedAt: Date.now(),
      })
    );
  } catch {
    // Продължаваме без sessionStorage.
  }
}

function restoreNumericPosition(targetX, targetY) {
  let frameId = 0;
  let attempts = 0;
  let cancelled = false;

  const restore = () => {
    if (cancelled) return;

    window.scrollTo({
      left: targetX,
      top: targetY,
      behavior: 'auto',
    });

    const xReached =
      Math.abs(window.scrollX - targetX) <= 2;

    const yReached =
      Math.abs(window.scrollY - targetY) <= 2;

    attempts += 1;

    if (
      (xReached && yReached) ||
      attempts >= MAX_RESTORE_ATTEMPTS
    ) {
      return;
    }

    frameId = window.requestAnimationFrame(restore);
  };

  frameId = window.requestAnimationFrame(restore);

  return () => {
    cancelled = true;

    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
  };
}

function restoreHashTarget(hash) {
  let frameId = 0;
  let attempts = 0;
  let cancelled = false;

  let targetId = hash.replace(/^#/, '');

  try {
    targetId = decodeURIComponent(targetId);
  } catch {
    // Използваме оригиналния ID.
  }

  const restore = () => {
    if (cancelled) return;

    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });

      return;
    }

    attempts += 1;

    if (attempts >= MAX_RESTORE_ATTEMPTS) {
      return;
    }

    frameId = window.requestAnimationFrame(restore);
  };

  frameId = window.requestAnimationFrame(restore);

  return () => {
    cancelled = true;

    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
  };
}

export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const routeKey = getRouteKey(location);
  const fullPath = getFullPath(location);

  const activeRouteKeyRef = useRef(routeKey);

  useEffect(() => {
    const previousValue =
      window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousValue;
    };
  }, []);

  useEffect(() => {
    activeRouteKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    let frameId = 0;
    let ticking = false;

    const persistPosition = () => {
      savePosition(
        activeRouteKeyRef.current,
        window.scrollX,
        window.scrollY
      );

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      frameId = window.requestAnimationFrame(
        persistPosition
      );
    };

    const handlePageHide = () => {
      savePosition(
        activeRouteKeyRef.current,
        window.scrollX,
        window.scrollY
      );
    };

    persistPosition();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const handleInternalLinkClick = (event) => {
      if (event.defaultPrevented) return;

      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest?.('a[href]');

      if (!anchor) return;

      if (
        anchor.hasAttribute('download') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      let destination;

      try {
        destination = new URL(
          anchor.getAttribute('href'),
          window.location.href
        );
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) {
        return;
      }

      const destinationPath =
        `${destination.pathname}${destination.search}${destination.hash}`;

      if (destinationPath === fullPath) {
        return;
      }

      savePosition(routeKey, window.scrollX, window.scrollY);

      saveNavigationOrigin({
        from: fullPath,
        to: destinationPath,
        scrollY: window.scrollY,
      });
    };

    document.addEventListener(
      'click',
      handleInternalLinkClick,
      true
    );

    return () => {
      document.removeEventListener(
        'click',
        handleInternalLinkClick,
        true
      );
    };
  }, [fullPath, routeKey]);

  useLayoutEffect(() => {
    const isFreshNavbarNavigation =
      navigationType !== 'POP' &&
      location.state?.navigationSource === 'navbar';

    /*
     * Navbar click = ново умишлено посещение.
     * Не възстановяваме стара позиция.
     */
    if (isFreshNavbarNavigation) {
      if (location.hash) {
        return restoreHashTarget(location.hash);
      }

      return restoreNumericPosition(0, 0);
    }

    const explicitScrollY = Number(
      location.state?.restoreScrollY
    );

    if (Number.isFinite(explicitScrollY)) {
      return restoreNumericPosition(0, explicitScrollY);
    }

    /*
     * Back / Forward = възстановяване на старата позиция.
     */
    if (navigationType === 'POP') {
      const saved = readPosition(routeKey);

      if (saved) {
        return restoreNumericPosition(saved.x, saved.y);
      }
    }

    if (location.hash) {
      return restoreHashTarget(location.hash);
    }

    return restoreNumericPosition(0, 0);
  }, [
    location.hash,
    location.state,
    navigationType,
    routeKey,
  ]);

  return null;
}
