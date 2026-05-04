import { useState, useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 60 * 1000;   // 1 min idle → show warning
const WARN_DURATION = 30;          // 30 second countdown

const useIdleTimer = (onLogout) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARN_DURATION);

  const idleTimer    = useRef(null);
  const logoutTimer  = useRef(null);
  const countdownRef = useRef(null);
  const warningShown = useRef(false);

  const clearAllTimers = () => {
    clearTimeout(idleTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownRef.current);
  };

  const startIdleWatch = () => {
    clearAllTimers();
    idleTimer.current = setTimeout(() => {
      warningShown.current = true;
      setShowWarning(true);
      setCountdown(WARN_DURATION);

      // Tick countdown
      let secs = WARN_DURATION;
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) clearInterval(countdownRef.current);
      }, 1000);

      // Auto logout after countdown
      logoutTimer.current = setTimeout(() => {
        onLogout();
      }, WARN_DURATION * 1000);

    }, IDLE_TIMEOUT);
  };

  const continueSession = () => {
    warningShown.current = false;
    setShowWarning(false);
    setCountdown(WARN_DURATION);
    startIdleWatch();
  };

  useEffect(() => {
    const handleActivity = () => {
      // Only reset if warning is NOT showing
      if (!warningShown.current) {
        startIdleWatch();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    startIdleWatch(); // kick off on mount

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearAllTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showWarning, countdown, continueSession };
};

export default useIdleTimer;
