import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useSettings } from '../../../hooks/useSettings.js';
import styles from './AnnouncementBar.module.css';

const STORAGE_KEY = 'ti_announcement_dismissed';

function AnnouncementBar() {
  const { data } = useSettings();
  const announcement = data?.announcement;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!announcement?.isActive || dismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className={styles.bar} role="region" aria-label="Site announcement">
      <p className={styles.message}>
        {announcement.link ? (
          <Link to={announcement.link} className={styles.link}>
            {announcement.text}
          </Link>
        ) : (
          announcement.text
        )}
      </p>
      <IconButton
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        size="small"
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </div>
  );
}

export default AnnouncementBar;
