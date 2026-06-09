import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getBackTarget } from './AdminUtils.js';

const INITIAL_ROUTE = {
  section: 'overview',
  itemId: '',
  settingsPanel: '',
};

function normalizeRoute(route = INITIAL_ROUTE) {
  return {
    section: route.section || 'overview',
    itemId: route.itemId || '',
    settingsPanel: route.settingsPanel || '',
  };
}

export default function useAdminNavigation() {
  const [route, setRoute] = useState(INITIAL_ROUTE);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const currentState = window.history.state || {};

    const initialRoute = normalizeRoute(
      currentState.dankovAdminRoute || INITIAL_ROUTE
    );

    const initialDepth = Number(
      currentState.dankovAdminDepth || 0
    );

    window.history.replaceState(
      {
        ...currentState,
        dankovAdminRoute: initialRoute,
        dankovAdminDepth: initialDepth,
      },
      ''
    );

    setRoute(initialRoute);
    mountedRef.current = true;

    const handlePopState = (event) => {
      setRoute(
        normalizeRoute(
          event.state?.dankovAdminRoute ||
            INITIAL_ROUTE
        )
      );
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  const navigate = useCallback(
    (nextRoute, options = {}) => {
      const normalized = normalizeRoute(nextRoute);

      if (
        typeof window === 'undefined' ||
        !mountedRef.current
      ) {
        setRoute(normalized);
        return;
      }

      const currentState =
        window.history.state || {};

      const currentDepth = Number(
        currentState.dankovAdminDepth || 0
      );

      const nextState = {
        ...currentState,
        dankovAdminRoute: normalized,
        dankovAdminDepth: options.replace
          ? currentDepth
          : currentDepth + 1,
      };

      if (options.replace) {
        window.history.replaceState(
          nextState,
          ''
        );
      } else {
        window.history.pushState(
          nextState,
          ''
        );
      }

      setRoute(normalized);
    },
    []
  );

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      const depth = Number(
        window.history.state
          ?.dankovAdminDepth || 0
      );

      if (depth > 0) {
        window.history.back();
        return;
      }
    }

    const fallback = getBackTarget(route);

    if (fallback) {
      navigate(fallback, {
        replace: true,
      });
    }
  }, [navigate, route]);

  const backTarget = useMemo(
    () => getBackTarget(route),
    [route]
  );

  return {
    route,
    navigate,
    goBack,
    canGoBack: Boolean(backTarget),
  };
}