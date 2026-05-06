import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

const DEFAULT_DAYS = 30;
const VALID_GRANULARITIES = new Set(['day', 'week', 'month']);

const todayEnd = () => dayjs().endOf('day');
const daysAgoStart = (n) => dayjs().subtract(n - 1, 'day').startOf('day');

const parseDate = (value, fallback) => {
  if (!value) return fallback;
  const d = dayjs(value);
  if (!d.isValid()) return fallback;
  return d;
};

export default function useReportsState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');
  const compareParam = searchParams.get('compare');
  const granularityParam = searchParams.get('granularity');

  const range = useMemo(() => {
    const fallbackEnd = todayEnd();
    const fallbackStart = daysAgoStart(DEFAULT_DAYS);
    const startDay = parseDate(startParam, fallbackStart).startOf('day');
    const endDay = parseDate(endParam, fallbackEnd).endOf('day');
    const safeStart = startDay.isAfter(endDay) ? endDay.startOf('day') : startDay;
    return {
      start: safeStart.toDate(),
      end: endDay.toDate(),
    };
  }, [startParam, endParam]);

  const comparePrevious = compareParam === '1' || compareParam === 'true';

  const granularity = VALID_GRANULARITIES.has(granularityParam)
    ? granularityParam
    : 'day';

  const days = useMemo(() => {
    const diff = dayjs(range.end).startOf('day').diff(
      dayjs(range.start).startOf('day'),
      'day',
    );
    return Math.max(1, diff + 1);
  }, [range.start, range.end]);

  const previousRange = useMemo(() => {
    const prevEnd = dayjs(range.start).subtract(1, 'day').endOf('day');
    const prevStart = prevEnd.subtract(days - 1, 'day').startOf('day');
    return { start: prevStart.toDate(), end: prevEnd.toDate() };
  }, [range.start, days]);

  const updateParams = useCallback(
    (updater) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          updater(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setRange = useCallback(
    (next) => {
      if (!next?.start || !next?.end) return;
      updateParams((p) => {
        p.set('start', dayjs(next.start).format('YYYY-MM-DD'));
        p.set('end', dayjs(next.end).format('YYYY-MM-DD'));
      });
    },
    [updateParams],
  );

  const setComparePrevious = useCallback(
    (next) => {
      updateParams((p) => {
        if (next) p.set('compare', '1');
        else p.delete('compare');
      });
    },
    [updateParams],
  );

  const setGranularity = useCallback(
    (next) => {
      if (!VALID_GRANULARITIES.has(next)) return;
      updateParams((p) => {
        if (next === 'day') p.delete('granularity');
        else p.set('granularity', next);
      });
    },
    [updateParams],
  );

  return {
    range,
    previousRange,
    comparePrevious,
    granularity,
    days,
    setRange,
    setComparePrevious,
    setGranularity,
  };
}

export { VALID_GRANULARITIES };
