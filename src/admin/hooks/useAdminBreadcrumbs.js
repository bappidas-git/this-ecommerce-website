import { useEffect } from 'react';
import { useAdminUI } from '../context/AdminUIContext.jsx';

export default function useAdminBreadcrumbs(items) {
  const { setBreadcrumbs } = useAdminUI();
  useEffect(() => {
    setBreadcrumbs(items || []);
    return () => setBreadcrumbs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)]);
}
