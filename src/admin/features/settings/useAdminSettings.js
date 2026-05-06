import { useCallback, useEffect, useRef, useState } from 'react';
import adminSettingsService from '../../../api/services/admin/adminSettingsService.js';
import { emitSettingsUpdated } from '../../../hooks/useSettings.js';

export default function useAdminSettings() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const remote = await adminSettingsService.get();
      if (!mountedRef.current) return;
      setData(remote || {});
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveGroup = useCallback(async (group, payload) => {
    setIsSaving(true);
    try {
      const next = await adminSettingsService.update(group, payload);
      if (mountedRef.current) {
        setData(next || {});
      }
      emitSettingsUpdated();
      return next;
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  }, []);

  return { data, isLoading, error, isSaving, refetch: fetchSettings, saveGroup };
}
