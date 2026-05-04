import Section from '../../../../components/common/Section.jsx';
import Container from '../../../../components/common/Container.jsx';
import Eyebrow from '../../../../components/common/Eyebrow.jsx';
import NewsletterForm from '../../../../components/common/NewsletterForm.jsx';

import styles from './NewsletterBand.module.css';

function NewsletterBand() {
  return (
    <Section tone="emerald" aria-labelledby="newsletter-band-title">
      <Container gutter maxWidth="md">
        <div className={styles.inner}>
          <Eyebrow color="brass" className={styles.eyebrow}>
            From the studio
          </Eyebrow>
          <h2 id="newsletter-band-title" className={styles.title}>
            Letters from the studio
          </h2>
          <p className={styles.kicker}>
            Quiet dispatches on new pieces, slow rituals, and the rooms we are
            dreaming of.
          </p>
          <div className={styles.formWrap}>
            <NewsletterForm
              tone="emerald"
              hint="One letter a month. Unsubscribe anytime."
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default NewsletterBand;
