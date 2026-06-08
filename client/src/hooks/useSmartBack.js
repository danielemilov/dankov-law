import { useCallback } from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

const LAST_NAVIGATION_KEY =
  'dankov-law:last-internal-navigation:v2';

function getCurrentPath(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function readLastNavigation() {
  try {
    const stored = window.sessionStorage.getItem(
      LAST_NAVIGATION_KEY
    );

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.from !== 'string' ||
      typeof parsed.to !== 'string'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearLastNavigation() {
  try {
    window.sessionStorage.removeItem(
      LAST_NAVIGATION_KEY
    );
  } catch {
    // Продължаваме, ако storage не е достъпен.
  }
}

function hasSameOriginReferrer() {
  if (!document.referrer) return false;

  try {
    const referrerUrl = new URL(
      document.referrer
    );

    return (
      referrerUrl.origin ===
      window.location.origin
    );
  } catch {
    return false;
  }
}

export default function useSmartBack(
  fallbackRoute = '/'
) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const currentPath =
      getCurrentPath(location);

    const historyIndex = Number(
      window.history.state?.idx
    );

    /*
     * Най-добрият вариант:
     * истинско връщане към предишния history entry.
     */
    if (
      Number.isFinite(historyIndex) &&
      historyIndex > 0
    ) {
      navigate(-1);
      return;
    }

    /*
     * Origin, подаден изрично чрез React Router state.
     */
    const stateOrigin =
      typeof location.state?.from === 'string'
        ? location.state.from
        : null;

    const stateScrollY = Number(
      location.state?.fromScrollY
    );

    if (
      stateOrigin &&
      stateOrigin !== currentPath
    ) {
      navigate(stateOrigin, {
        replace: true,
        state: Number.isFinite(stateScrollY)
          ? {
              restoreScrollY: stateScrollY,
            }
          : undefined,
      });

      return;
    }

    /*
     * Origin, записан автоматично преди кликване
     * върху вътрешен линк.
     */
    const lastNavigation =
      readLastNavigation();

    if (
      lastNavigation &&
      lastNavigation.to === currentPath &&
      lastNavigation.from !== currentPath
    ) {
      clearLastNavigation();

      navigate(lastNavigation.from, {
        replace: true,
        state: {
          restoreScrollY:
            Number(lastNavigation.scrollY) || 0,
        },
      });

      return;
    }

    /*
     * Покрива и обикновени <a href>, които са
     * презаредили приложението.
     */
    if (
      window.history.length > 1 &&
      hasSameOriginReferrer()
    ) {
      window.history.back();
      return;
    }

    /*
     * Директно отворена страница.
     */
    navigate(fallbackRoute, {
      replace: true,
    });
  }, [
    fallbackRoute,
    location,
    navigate,
  ]);
}