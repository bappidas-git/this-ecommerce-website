import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import SectionHeader from '../../../components/common/SectionHeader.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Seo from '../../../components/common/Seo.jsx';
import { PATHS } from '../../../routes/paths.js';

import styles from './AboutPage.module.css';

const HERO_IMAGE =
  'https://placehold.co/1600x900/1F4034/F7F3ED?text=THIS+Atelier&font=cormorant';

const STORY_IMAGE =
  'https://placehold.co/900x1100/E5DED2/4A453E?text=The+Studio&font=cormorant';

const STORY_PARAGRAPHS = [
  'THIS Interiors began in a quiet Al Quoz warehouse with a small bench, two chairs, and the conviction that a home object should outlive a season. We work in marble, brass, linen and stone — materials that take time to settle, and only get better for it.',
  'Each piece is drawn in the studio and finished by hand. Some are made in Dubai by our own team; others travel from a small circle of ateliers we have known for years. We choose makers the way we choose materials: carefully, and for the long run.',
  'Our taste is editorial but lived‑in. Cream, ink, brass, and a quiet emerald. Soft edges. Visible craft. We are not chasing trends — we are trying to make the kind of pieces you forget you bought, because they always seem to have been there.',
  'We ship across the GCC and welcome visits to the studio by appointment. If you are working on a project, we are happy to talk through finishes, sizes, and lead times in person.',
];

const PILLARS = [
  {
    number: '01',
    title: 'Considered design',
    kicker: 'Every line drawn in studio, refined over months, and tested in real rooms before it ships.',
  },
  {
    number: '02',
    title: 'Hand‑finished craft',
    kicker: 'Sanded, oiled and assembled by a small team — small batches, never rushed.',
  },
  {
    number: '03',
    title: 'Local atelier',
    kicker: 'Made in Dubai with regional makers we have known for years. You can visit us.',
  },
];

const COUNTERS = [
  { value: 12, suffix: '', label: 'Years of craft' },
  { value: 1800, suffix: '+', label: 'Pieces shipped' },
  { value: 8, suffix: '', label: 'Collaborators' },
  { value: 1, suffix: '', label: 'City' },
];

const PRESS_LOGOS = Array.from({ length: 5 }, (_, i) => ({
  alt: `Press logo ${i + 1}`,
  src: `https://placehold.co/200x56/F7F3ED/8C8678?text=Press+0${i + 1}&font=cormorant`,
}));

function formatCounter(value) {
  return value.toLocaleString('en-US');
}

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion) {
      setDisplay(value);
      return undefined;
    }
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, prefersReducedMotion]);

  return (
    <span ref={ref} className={styles.counterValue}>
      {formatCounter(display)}
      {suffix}
    </span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] },
};

function AboutPage() {
  return (
    <>
      <Seo
        title="About THIS Interiors"
        description="A small Dubai atelier making considered, hand‑finished pieces in marble, brass, linen and stone — designed to outlast trends."
        image="https://placehold.co/1200x630/1F4034/F7F3ED?text=THIS+Interiors&font=cormorant"
      />

      {/* HERO */}
      <section
        className={styles.hero}
        aria-labelledby="about-hero-title"
      >
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          role="img"
          aria-label="THIS Interiors atelier in Dubai"
        />
        <div className={styles.heroOverlay} aria-hidden />
        <Container gutter className={styles.heroInner}>
          <motion.div className={styles.heroContent} {...fadeUp}>
            <Eyebrow color="brass">The studio</Eyebrow>
            <h1 id="about-hero-title" className={styles.heroTitle}>
              Designed in Dubai. Made to outlast trends.
            </h1>
            <p className={styles.heroKicker}>
              A small atelier working in marble, brass, linen and stone — quiet pieces, hand‑finished, made to live with for years.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* STORY */}
      <Section tone="cream" aria-labelledby="about-story-title">
        <Container gutter>
          <div className={styles.storyGrid}>
            <motion.div className={styles.storyImageWrap} {...fadeUp}>
              <img
                src={STORY_IMAGE}
                alt="Inside the THIS Interiors studio"
                className={styles.storyImage}
                loading="lazy"
              />
            </motion.div>
            <motion.div className={styles.storyText} {...fadeUp}>
              <Eyebrow color="muted">Our story</Eyebrow>
              <h2 id="about-story-title" className={styles.storyTitle}>
                A studio for considered objects.
              </h2>
              {STORY_PARAGRAPHS.map((paragraph, i) => (
                <p key={i} className={styles.storyParagraph}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* PILLARS */}
      <Section tone="surface" aria-labelledby="about-pillars-title">
        <Container gutter>
          <SectionHeader
            id="about-pillars-title"
            eyebrow="What guides us"
            title="Three quiet principles."
            kicker="They show up in every drawing, every finish, and every piece that leaves the studio."
            tone="surface"
          />
          <div className={styles.pillars} style={{ marginTop: 32 }}>
            {PILLARS.map((pillar) => (
              <motion.article
                key={pillar.number}
                className={styles.pillarCard}
                {...fadeUp}
              >
                <span className={styles.pillarNumber}>{pillar.number}</span>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarKicker}>{pillar.kicker}</p>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>

      {/* COUNTERS */}
      <Section tone="emerald" aria-labelledby="about-counters-title">
        <Container gutter>
          <SectionHeader
            id="about-counters-title"
            eyebrow="By the numbers"
            title="A small studio, quietly busy."
            tone="emerald"
          />
          <div className={styles.counters} style={{ marginTop: 32 }}>
            {COUNTERS.map((c) => (
              <div key={c.label} className={styles.counterItem}>
                <Counter value={c.value} suffix={c.suffix} />
                <span className={styles.counterLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* PRESS */}
      <Section tone="cream" aria-labelledby="about-press-title">
        <Container gutter>
          <SectionHeader
            id="about-press-title"
            eyebrow="Press"
            title="Quietly noticed."
            kicker="A few of the publications that have written about the studio."
            tone="cream"
            align="center"
          />
          <motion.div
            className={styles.pressGrid}
            style={{ marginTop: 40 }}
            {...fadeUp}
          >
            {PRESS_LOGOS.map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className={styles.pressLogo}
                loading="lazy"
              />
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* CTA */}
      <Section tone="surface" dense aria-labelledby="about-cta-title">
        <Container gutter>
          <motion.div className={styles.ctaStrip} {...fadeUp}>
            <Eyebrow color="brass">Visit us</Eyebrow>
            <h2 id="about-cta-title" className={styles.ctaTitle}>
              Visit the atelier.
            </h2>
            <p className={styles.ctaKicker}>
              We are happy to walk you through finishes and lead times in person. Appointments preferred.
            </p>
            <AppButton variant="primary" size="large" to={PATHS.contact}>
              Visit the atelier
            </AppButton>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}

export default AboutPage;
