import { useSettings } from '../../../hooks/useSettings.js';
import styles from './SocialIcons.module.css';

function Svg({ size = 18, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.8.25 2.2.42a3.7 3.7 0 0 1 1.4.9c.4.4.7.86.9 1.4.18.4.37 1 .42 2.2.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.2-.24 1.8-.42 2.2a3.7 3.7 0 0 1-.9 1.4 3.7 3.7 0 0 1-1.4.9c-.4.18-1 .37-2.2.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.05-1.8-.24-2.2-.42a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.18-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.2.24-1.8.42-2.2a3.7 3.7 0 0 1 .9-1.4 3.7 3.7 0 0 1 1.4-.9c.4-.18 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 2c-3.16 0-3.5 0-4.74.07-1.13.05-1.74.24-2.15.4-.54.2-.92.46-1.33.86-.4.4-.66.79-.87 1.33-.16.41-.34 1.02-.39 2.15C2.45 9.85 2.44 10.2 2.44 13.36s0 3.5.07 4.74c.05 1.13.24 1.74.4 2.15.2.54.46.92.86 1.33.4.4.79.66 1.33.87.41.16 1.02.34 2.15.39 1.24.07 1.58.07 4.74.07s3.5 0 4.74-.07c1.13-.05 1.74-.24 2.15-.4a3.6 3.6 0 0 0 1.33-.86c.4-.4.66-.79.87-1.33.16-.41.34-1.02.39-2.15.07-1.24.07-1.58.07-4.74s0-3.5-.07-4.74c-.05-1.13-.24-1.74-.4-2.15a3.6 3.6 0 0 0-.86-1.33 3.6 3.6 0 0 0-1.33-.87c-.41-.16-1.02-.34-2.15-.39-1.24-.07-1.58-.07-4.74-.07zm0 3.4a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm5.6-2.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </Svg>
  );
}

function PinterestIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12.04 2C6.5 2 2 6.49 2 12.03c0 4.25 2.65 7.88 6.39 9.34-.09-.79-.17-2.01.04-2.88.18-.76 1.18-4.85 1.18-4.85s-.3-.6-.3-1.49c0-1.4.81-2.45 1.82-2.45.86 0 1.27.65 1.27 1.42 0 .87-.55 2.16-.84 3.36-.24 1.01.51 1.83 1.5 1.83 1.81 0 3.2-1.91 3.2-4.66 0-2.44-1.75-4.14-4.25-4.14-2.9 0-4.6 2.17-4.6 4.41 0 .87.34 1.81.76 2.32.08.1.09.18.07.28-.07.31-.24.96-.27 1.09-.04.18-.14.22-.32.13-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.34-5.81 3.33 0 5.92 2.37 5.92 5.54 0 3.31-2.09 5.97-4.99 5.97-.97 0-1.89-.51-2.2-1.11l-.6 2.28c-.21.83-.79 1.87-1.18 2.5.89.27 1.83.42 2.81.42 5.55 0 10.04-4.49 10.04-10.03C22.04 6.49 17.55 2 12.04 2z" />
    </Svg>
  );
}

function TikTokIcon(props) {
  return (
    <Svg {...props}>
      <path d="M19.6 6.7a4.7 4.7 0 0 1-3.5-1.6V15a5.6 5.6 0 1 1-5.6-5.6c.3 0 .5 0 .8.07v2.6a3 3 0 1 0 2.1 2.86V2h2.5a4.7 4.7 0 0 0 3.7 4.5v2.2z" />
    </Svg>
  );
}

function FacebookIcon(props) {
  return (
    <Svg {...props}>
      <path d="M13.5 21.95V14h2.7l.4-3.13H13.5V8.86c0-.9.25-1.52 1.55-1.52h1.66V4.55c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.13v2.31H7.55V14h2.72v7.95h3.23z" />
    </Svg>
  );
}

const SOCIALS = [
  { id: 'instagram', label: 'Instagram', key: 'instagram', Icon: InstagramIcon },
  { id: 'pinterest', label: 'Pinterest', key: 'pinterest', Icon: PinterestIcon },
  { id: 'tiktok', label: 'TikTok', key: 'tiktok', Icon: TikTokIcon },
  { id: 'facebook', label: 'Facebook', key: 'facebook', Icon: FacebookIcon },
];

function SocialIcons() {
  const { data } = useSettings();
  const social = data?.social || {};

  return (
    <ul className={styles.list} aria-label="Follow us on social media">
      {SOCIALS.map(({ id, label, key, Icon }) => {
        const url = social[key] || '#';
        return (
          <li key={id} className={styles.item}>
            <a
              href={url}
              className={styles.link}
              aria-label={`${label} (opens in a new tab)`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon size={18} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default SocialIcons;
