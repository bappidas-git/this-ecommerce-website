import StarRoundedIcon from '@mui/icons-material/StarRounded';

import Section from '../../../../components/common/Section.jsx';
import Container from '../../../../components/common/Container.jsx';
import SectionHeader from '../../../../components/common/SectionHeader.jsx';

import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    id: 'reem',
    quote:
      'Every piece looks even more beautiful in our home than online. The vase has become the heart of our living room.',
    name: 'Reem A.',
    location: 'Jumeirah, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=RA&font=playfair',
  },
  {
    id: 'jad',
    quote:
      'It feels like the studio knew exactly what our apartment needed. Quiet, considered, and beautifully made.',
    name: 'Jad K.',
    location: 'City Walk, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=JK&font=playfair',
  },
  {
    id: 'noor',
    quote:
      'The lamp arrived in this gorgeous linen wrap — gift-worthy before it was even unwrapped. Such warmth in the details.',
    name: 'Noor F.',
    location: 'Al Barsha, Dubai',
    avatar: 'https://placehold.co/120x120/B8924F/F7F3ED?text=NF&font=playfair',
  },
];

function TestimonialCard({ item }) {
  return (
    <figure className={styles.card}>
      <span className={styles.mark} aria-hidden="true">
        &ldquo;
      </span>
      <span className={styles.stars} aria-label="Five star review">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarRoundedIcon
            key={i}
            aria-hidden="true"
            style={{ color: 'var(--color-brass)', fontSize: 16 }}
          />
        ))}
      </span>
      <blockquote className={styles.quote}>{item.quote}</blockquote>
      <span className={styles.divider} aria-hidden="true" />
      <figcaption className={styles.attribution}>
        <img
          src={item.avatar}
          alt=""
          className={styles.avatar}
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <span className={styles.identity}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.location}>{item.location}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Testimonials() {
  return (
    <Section tone="surface" aria-labelledby="testimonials-title">
      <Container gutter>
        <SectionHeader
          eyebrow="From our customers"
          title="Heard from our customers"
          align="center"
          id="testimonials-title"
        />

        <ul className={styles.grid} aria-label="Customer testimonials">
          {TESTIMONIALS.map((t) => (
            <li key={t.id} className={styles.item}>
              <TestimonialCard item={t} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export default Testimonials;
