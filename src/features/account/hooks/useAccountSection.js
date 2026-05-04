import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function useAccountSection({ title, descriptor } = {}) {
  const ctx = useOutletContext();
  const setSection = ctx?.setSection;

  useEffect(() => {
    if (!setSection) return undefined;
    if (title === undefined && descriptor === undefined) return undefined;
    setSection({ title, descriptor });
    return () => setSection(null);
  }, [setSection, title, descriptor]);
}
