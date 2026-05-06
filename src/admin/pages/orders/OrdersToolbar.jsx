import { useEffect, useMemo, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AdminDateRangePicker from '../../components/AdminDateRangePicker.jsx';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '../../features/orders/orderStatus.js';

import styles from './OrdersToolbar.module.css';

const SEARCH_DEBOUNCE_MS = 250;

const splitStatuses = (csv) =>
  String(csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => ORDER_STATUS_VALUES.includes(s));

const joinStatuses = (arr) => (arr || []).join(',');

const toIsoDay = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

function OrdersToolbar({
  search,
  onSearch,
  status,
  onStatus,
  paymentMethod,
  onPaymentMethod,
  paymentStatus,
  onPaymentStatus,
  from,
  to,
  onDateRange,
  onReset,
  hasActiveFilters,
}) {
  const [localQ, setLocalQ] = useState(search ?? '');

  useEffect(() => {
    setLocalQ(search ?? '');
  }, [search]);

  useEffect(() => {
    if (localQ === (search ?? '')) return undefined;
    const id = setTimeout(() => onSearch(localQ), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const selectedStatuses = useMemo(() => splitStatuses(status), [status]);

  const dateValue = useMemo(() => {
    if (from && to) {
      return { start: new Date(from), end: new Date(to) };
    }
    return null;
  }, [from, to]);

  const handleStatusChange = (event) => {
    const value = event.target.value;
    const arr = Array.isArray(value) ? value : [value];
    onStatus(joinStatuses(arr));
  };

  const handleDateChange = (range) => {
    if (!range || !range.start || !range.end) {
      onDateRange({ from: '', to: '' });
      return;
    }
    onDateRange({ from: toIsoDay(range.start), to: toIsoDay(range.end) });
  };

  return (
    <div className={styles.root} role="search" aria-label="Filter orders">
      <div className={styles.searchCell}>
        <AppTextField
          aria-label="Search orders"
          placeholder="Search by order number, customer email or name…"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: localQ ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  size="small"
                  edge="end"
                  onClick={() => {
                    setLocalQ('');
                    onSearch('');
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </div>

      <div className={styles.filterCell}>
        <FormControl size="small" fullWidth>
          <InputLabel id="orders-status-label">Status</InputLabel>
          <Select
            labelId="orders-status-label"
            label="Status"
            multiple
            value={selectedStatuses}
            onChange={handleStatusChange}
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return <span className={styles.placeholder}>All statuses</span>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((s) => (
                    <Chip
                      key={s}
                      label={ORDER_STATUS_LABELS[s] || s}
                      size="small"
                    />
                  ))}
                </Box>
              );
            }}
          >
            {ORDER_STATUS_VALUES.map((s) => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={selectedStatuses.indexOf(s) > -1} />
                <ListItemText primary={ORDER_STATUS_LABELS[s]} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Payment method"
          size="small"
          value={paymentMethod ?? ''}
          onChange={(e) => onPaymentMethod(e.target.value)}
          options={PAYMENT_METHOD_OPTIONS}
        />
      </div>

      <div className={styles.filterCell}>
        <AppSelect
          label="Payment status"
          size="small"
          value={paymentStatus ?? ''}
          onChange={(e) => onPaymentStatus(e.target.value)}
          options={PAYMENT_STATUS_OPTIONS}
        />
      </div>

      <div className={styles.dateCell}>
        <AdminDateRangePicker value={dateValue} onChange={handleDateChange} />
      </div>

      {hasActiveFilters ? (
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export default OrdersToolbar;
