import { useEffect, useMemo, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import Seo from '../../../components/common/Seo.jsx';

import styles from './Faq.module.css';

const FAQ_GROUPS = [
  {
    id: 'orders',
    title: 'Orders',
    kicker: 'Placing, paying, and changing orders.',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Add pieces to your cart, head to checkout, and choose your address and payment method. We will email a confirmation as soon as the order is logged in our studio.',
      },
      {
        q: 'Which payment methods do you accept?',
        a: 'We accept all major credit and debit cards, cash on delivery within the UAE, and bank transfer for orders above AED 1,500. Bank details are issued at checkout.',
      },
      {
        q: 'Can I change or cancel an order after placing it?',
        a: 'Yes — within two hours of placing your order, before it enters our packing queue. Email studio@thisinteriors.com with your order number and we will help.',
      },
      {
        q: 'Will I receive an invoice?',
        a: 'A VAT invoice is emailed automatically once your order is dispatched, and is also available from the Orders section of your account.',
      },
      {
        q: 'Do you take corporate or trade orders?',
        a: 'We do — please write to studio@thisinteriors.com with the brief, sizes, and quantities. Trade and styling pricing is available on request.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    kicker: 'Shipping times, fees, and tracking.',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Within Dubai we deliver in 1–3 working days. The wider UAE takes 2–4 working days. Made‑to‑order pieces have lead times noted on the product page.',
      },
      {
        q: 'How much does shipping cost?',
        a: 'Standard delivery within the UAE is AED 25. Orders over AED 500 ship free of charge. International rates are calculated at checkout.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes. As soon as your order leaves the studio you will receive an email with a tracking link. You can also follow status from your account.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'We ship across the GCC and to the UK, EU, and US for select pieces. Larger furniture is shipped on request — please contact the studio for a quote.',
      },
      {
        q: 'Will someone deliver to my apartment door?',
        a: 'Within Dubai and Abu Dhabi, yes. Outside those cities, the courier will deliver to your building entrance unless you request otherwise.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    kicker: 'Our 14‑day window and the fine print.',
    items: [
      {
        q: 'What is your returns policy?',
        a: 'You can return most pieces within 14 days of delivery, in their original packaging and unused condition. Made‑to‑order pieces are final sale.',
      },
      {
        q: 'How do I start a return?',
        a: 'Email studio@thisinteriors.com with your order number and the reason for return. We will send a courier within 2 working days within the UAE.',
      },
      {
        q: 'Who pays for return shipping?',
        a: 'For change‑of‑mind returns, AED 25 is deducted from your refund. For damaged or incorrect items, we cover the return cost in full.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are issued to the original payment method within 5–7 working days of the piece arriving back at the studio.',
      },
      {
        q: 'Can I exchange a piece for another size or finish?',
        a: 'Yes, subject to availability. Let us know in your return email and we will reserve the replacement before issuing the return label.',
      },
    ],
  },
  {
    id: 'care',
    title: 'Care',
    kicker: 'Looking after marble, brass, linen, and wood.',
    items: [
      {
        q: 'How do I care for marble pieces?',
        a: 'Wipe with a soft, damp cloth and a neutral pH soap. Avoid acidic cleaners (lemon, vinegar) which can etch the surface. Reseal once a year.',
      },
      {
        q: 'My brass piece looks darker — is that normal?',
        a: 'Yes. Brass develops a soft patina over time, which we love. To brighten it, use a brass polish sparingly and follow with a dry buff.',
      },
      {
        q: 'How should I wash linen covers?',
        a: 'Cold machine wash on a gentle cycle, line dry, and iron while slightly damp for the softest finish. Avoid bleach.',
      },
      {
        q: 'How do I keep wooden pieces looking their best?',
        a: 'Dust regularly and apply a thin coat of furniture oil every 6 months. Keep out of direct sunlight to prevent uneven fading.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    kicker: 'Logging in, updating details, and privacy.',
    items: [
      {
        q: 'Do I need an account to order?',
        a: 'No — guest checkout is available. An account makes tracking, returns and reordering faster, and lets you save addresses and a wishlist.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Use the forgot password link on the login page. We will email a reset link valid for one hour.',
      },
      {
        q: 'How do I update my address or contact details?',
        a: 'Sign in and head to Account → Profile or Account → Addresses. Changes apply to future orders only.',
      },
      {
        q: 'How do you protect my personal data?',
        a: 'We follow UAE data protection guidelines and never sell your data. Read our Privacy Policy for the full picture.',
      },
    ],
  },
  {
    id: 'press',
    title: 'Press',
    kicker: 'For editors, stylists, and collaborators.',
    items: [
      {
        q: 'Where can I find press materials?',
        a: 'Email press@thisinteriors.com and we will send a current press kit with high‑resolution imagery, captions, and pricing.',
      },
      {
        q: 'Do you loan pieces for editorial shoots?',
        a: 'Yes, on a case‑by‑case basis. We ask for a small refundable deposit and that pieces return clean and undamaged.',
      },
      {
        q: 'Can I interview the founder or visit the atelier?',
        a: 'Often, yes. Send us the angle and outlet at press@thisinteriors.com and we will be in touch within a few business days.',
      },
      {
        q: 'Are images cleared for reproduction?',
        a: 'All studio imagery is cleared for editorial use with a credit to THIS Interiors. Commercial usage requires written approval.',
      },
    ],
  },
];

const SEO_TITLE = 'Frequently Asked Questions — THIS Interiors';
const SEO_DESCRIPTION =
  'Answers to common questions about orders, delivery, returns, care, accounts and press at THIS Interiors.';

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const re = new RegExp(`(${escapeRegExp(query)})`, 'ig');
  const parts = String(text).split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function buildFaqJsonLd(groups) {
  const mainEntity = groups.flatMap((g) =>
    g.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

function Faq() {
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const debouncedSetQuery = useRef(debounce((v) => setQuery(v.trim()), 200));

  useEffect(() => {
    debouncedSetQuery.current(rawQuery);
  }, [rawQuery]);

  const filtered = useMemo(() => {
    if (!query) return FAQ_GROUPS;
    const needle = query.toLowerCase();
    return FAQ_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (it) =>
          it.q.toLowerCase().includes(needle) || it.a.toLowerCase().includes(needle),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const totalMatches = filtered.reduce((acc, g) => acc + g.items.length, 0);
  const jsonLd = useMemo(() => buildFaqJsonLd(FAQ_GROUPS), []);

  return (
    <>
      <Seo title={SEO_TITLE} description={SEO_DESCRIPTION} jsonLd={jsonLd} />

      <Section tone="cream" className={styles.header}>
        <Container gutter>
          <div className={styles.headerInner}>
            <Eyebrow color="brass">Help</Eyebrow>
            <h1 className={styles.title}>Frequently asked questions</h1>
            <p className={styles.kicker}>
              Quick answers about orders, delivery, returns, and looking after your pieces. Still need a hand? Write to studio@thisinteriors.com.
            </p>

            <div className={styles.searchWrap} role="search">
              <span className={styles.searchIcon} aria-hidden>
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search questions…"
                aria-label="Search frequently asked questions"
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
              />
              {query ? (
                <p className={styles.searchMeta} aria-live="polite">
                  {totalMatches} {totalMatches === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.layout}>
            <aside className={styles.toc} aria-label="Sections">
              <p className={styles.tocHeading}>Sections</p>
              <ul className={styles.tocList}>
                {FAQ_GROUPS.map((g) => (
                  <li key={g.id}>
                    <a className={styles.tocLink} href={`#${g.id}`}>
                      {g.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>

            <div className={styles.body}>
              {filtered.length === 0 ? (
                <p className={styles.empty}>
                  No results for &ldquo;{query}&rdquo;. Try a different word.
                </p>
              ) : (
                filtered.map((group) => (
                  <section
                    key={group.id}
                    id={group.id}
                    className={styles.group}
                    aria-labelledby={`${group.id}-title`}
                  >
                    <h2 id={`${group.id}-title`} className={styles.groupTitle}>
                      {group.title}
                    </h2>
                    <p className={styles.groupKicker}>{group.kicker}</p>
                    <div className={styles.accordionWrap}>
                      {group.items.map((item, idx) => (
                        <Accordion
                          key={`${group.id}-${idx}`}
                          defaultExpanded={Boolean(query)}
                          disableGutters
                          square
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`${group.id}-${idx}-content`}
                            id={`${group.id}-${idx}-header`}
                          >
                            <Highlight text={item.q} query={query} />
                          </AccordionSummary>
                          <AccordionDetails id={`${group.id}-${idx}-content`}>
                            <p>
                              <Highlight text={item.a} query={query} />
                            </p>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default Faq;
