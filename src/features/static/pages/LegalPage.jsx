import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';

import styles from './LegalPage.module.css';

function formatDate(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function LegalPage({
  eyebrow,
  title,
  kicker,
  updatedAt,
  topSlot,
  sections,
}) {
  const updated = formatDate(updatedAt);

  return (
    <Section tone="cream" className={styles.header}>
      <Container gutter>
        <Eyebrow color="brass">{eyebrow}</Eyebrow>
        <h1 className={styles.title}>{title}</h1>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {updated ? <p className={styles.meta}>Last updated {updated}</p> : null}

        <div className={styles.layout}>
          <aside className={styles.toc} aria-label="Sections">
            <p className={styles.tocHeading}>Sections</p>
            <ul className={styles.tocList}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a className={styles.tocLink} href={`#${s.id}`}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {topSlot}
            <article className={styles.prose}>
              {sections.map((s) => (
                <section key={s.id} id={s.id}>
                  <h2>{s.title}</h2>
                  {s.body}
                </section>
              ))}
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export { styles as legalStyles };
export default LegalPage;
