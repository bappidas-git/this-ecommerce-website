import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export default function useUnsavedChangesPrompt(when) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!when) return false;
    return currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (!when) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);

  return blocker;
}
