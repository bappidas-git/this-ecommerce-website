import { Helmet } from 'react-helmet-async';
import Section from './Section.jsx';
import Container from './Container.jsx';
import styles from './PageStub.module.css';

function PageStub({ name, eyebrow, kicker, tone = 'cream' }) {
  const title = `${name} — THIS Interiors`;
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
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
