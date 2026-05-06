import { useEffect, useState } from 'react';

const getInitialOnline = () => {
  if (typeof navigator === 'undefined') return true;
  if (typeof navigator.onLine !== 'boolean') return true;
  return navigator.onLine;
};

export default function useOnlineStatus() {
  const [online, setOnline] = useState(getInitialOnline);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online };
}
