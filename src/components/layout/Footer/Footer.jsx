import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Section from '../../common/Section.jsx';
import Container from '../../common/Container.jsx';
import Eyebrow from '../../common/Eyebrow.jsx';
import { PATHS } from '../../../routes/paths.js';
import { useSettings } from '../../../hooks/useSettings.js';
import NewsletterForm from './NewsletterForm.jsx';
import SocialIcons from './SocialIcons.jsx';
import PaymentIcons from './PaymentIcons.jsx';
import styles from './Footer.module.css';

const SHOP_LINKS = [
  { label: 'New', to: `${PATHS.shop}?sort=newest` },
  { label: 'Bestsellers', to: `${PATHS.shop}?sort=bestsellers` },
  { label: 'Vases', to: PATHS.category('vases') },
  { label: 'Lamps', to: PATHS.category('lamps') },
  { label: 'Mirrors', to: PATHS.category('mirrors') },
  { label: 'All categories', to: PATHS.shop },
];

const ACCOUNT_LINKS = [
  { label: 'Sign in', to: PATHS.auth.login },
  { label: 'Create account', to: PATHS.auth.register },
  { label: 'Wishlist', to: PATHS.wishlist },
  { label: 'My orders', to: PATHS.account.orders },
  { label: 'Address book', to: PATHS.account.addresses },
];

const HELP_LINKS = [
  { label: 'Contact', to: PATHS.contact },
  { label: 'Shipping & Returns', to: PATHS.shippingReturns },
  { label: 'FAQ', to: PATHS.faq },
  { label: 'Privacy', to: PATHS.privacy },
  { label: 'Terms', to: PATHS.terms },
];

function NavLinks({ links }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to} className={styles.link}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavColumn({ title, links, asAccordion }) {
  if (asAccordion) {
    return (
      <div className={styles.navColumn}>
        <details className={styles.details}>
          <summary className={styles.summary}>
            <span className={styles.summaryLabel}>{title}</span>
            <span className={styles.summaryIcon} aria-hidden>
              +
            </span>
          </summary>
          <NavLinks links={links} />
        </details>
      </div>
    );
  }

  return (
    <div className={styles.navColumn}>
      <h3 className={styles.columnHeading}>{title}</h3>
      <NavLinks links={links} />
    </div>
  );
}

function Footer() {
  const { data } = useSettings();
  const brandName = data?.branding?.logoText || 'THIS Interiors';
  const statement =
    data?.branding?.statement ||
    'Editorial homewares assembled in Dubai. Quiet pieces, considered materials, made to live with for years.';
  const addressLines = data?.contact?.addressLines || [];
  const prefersReducedMotion = useReducedMotion();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fadeUp = prefersReducedMotion
    ? { initial: false, whileInView: undefined }
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.6, ease: [0.2, 0.6, 0.2, 1] },
      };

  return (
    <Section as="footer" tone="ink" className={styles.footer} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className={styles.srOnly}>
        Site footer
      </h2>
      <Container maxWidth="lg" gutter>
        <div className={styles.grid}>
          <motion.div className={styles.brandColumn} {...fadeUp}>
            <Link to={PATHS.home} className={styles.wordmark} aria-label={`${brandName} home`}>
              {brandName}
            </Link>
            <p className={styles.statement}>{statement}</p>
            {addressLines.length > 0 && (
              <address className={styles.address}>
                {addressLines.map((line) => (
                  <span key={line} className={styles.addressLine}>
                    {line}
                  </span>
                ))}
              </address>
            )}
          </motion.div>

          <NavColumn title="Shop" links={SHOP_LINKS} asAccordion={isMobile} />
          <NavColumn title="Account" links={ACCOUNT_LINKS} asAccordion={isMobile} />
          <NavColumn title="Help" links={HELP_LINKS} asAccordion={isMobile} />

          <div className={styles.newsletterColumn}>
            <Eyebrow color="brass" className={styles.newsletterEyebrow}>
              Letters from the studio
            </Eyebrow>
            <p className={styles.newsletterKicker}>
              Quiet dispatches on new pieces, slow rituals, and the rooms we are dreaming of.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className={styles.divider} aria-hidden />

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <span className={styles.copy}>
              &copy; {new Date().getFullYear()} {brandName}
            </span>
            <span className={styles.dot} aria-hidden>
              &middot;
            </span>
            <span className={styles.designed}>Designed in Dubai</span>
          </div>
          <div className={styles.bottomCenter}>
            <SocialIcons />
          </div>
          <div className={styles.bottomRight}>
            <PaymentIcons />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Footer;
