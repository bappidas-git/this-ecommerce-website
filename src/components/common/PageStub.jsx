import Section from './Section.jsx';
import Container from './Container.jsx';
import Seo from './Seo.jsx';
import styles from './PageStub.module.css';

function PageStub({ name, eyebrow, kicker, tone = 'cream' }) {
  const title = `${name} — THIS Interiors`;
  return (
    <>
      <Seo title={title} />
      <Section tone={tone}>
        <Container gutter>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.heading}>{name}</h1>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        </Container>
      </Section>
    </>
  );
}

export default PageStub;
