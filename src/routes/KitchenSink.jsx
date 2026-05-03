import Button from '@mui/material/Button';
import Section from '../components/common/Section.jsx';
import Container from '../components/common/Container.jsx';
import Eyebrow from '../components/common/Eyebrow.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import PriceTag from '../components/common/PriceTag.jsx';
import utils from '../styles/utilities.module.css';

function Group({ title, children }) {
  return (
    <div className={utils.stack} style={{ gap: 16 }}>
      <Eyebrow color="brass">{title}</Eyebrow>
      <div className={utils.stack} style={{ gap: 12 }}>
        {children}
      </div>
      <hr className={utils.divider} />
    </div>
  );
}

function KitchenSink() {
  return (
    <>
      <Section tone="cream">
        <Container gutter>
          <SectionHeader
            eyebrow="Kitchen Sink"
            title="Editorial primitives preview"
            kicker="A development-only canvas to verify Section, Container, Eyebrow, SectionHeader, and PriceTag at three sizes and across tones."
            cta={<Button variant="contained">Primary CTA</Button>}
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container gutter>
          <div className={utils.stack} style={{ gap: 32 }}>
            <Group title="Eyebrow / colors">
              <Eyebrow color="muted">Muted eyebrow</Eyebrow>
              <Eyebrow color="brass">Brass eyebrow</Eyebrow>
              <Eyebrow color="emerald">Emerald eyebrow</Eyebrow>
              <span style={{ background: 'var(--color-ink)', padding: '8px 12px' }}>
                <Eyebrow color="bg">On dark eyebrow</Eyebrow>
              </span>
            </Group>

            <Group title="PriceTag / sizes">
              <PriceTag value={249} size="sm" />
              <PriceTag value={249} size="md" />
              <PriceTag value={249} size="lg" />
              <PriceTag value={199} compareAt={299} size="sm" />
              <PriceTag value={199} compareAt={299} size="md" />
              <PriceTag value={199} compareAt={299} size="lg" />
            </Group>

            <Group title="SectionHeader / center">
              <SectionHeader
                align="center"
                eyebrow="Centered"
                title="A calm, editorial headline"
                kicker="Mobile-first, AA-accessible, and reveals once on scroll."
              />
            </Group>

            <Group title="Utilities">
              <span className={utils.fadeIn}>fadeIn animation sample</span>
              <span className={utils.editorialRule} aria-hidden />
              <div className={utils.row}>
                <span>Row item A</span>
                <span>Row item B</span>
                <span>Row item C</span>
              </div>
              <div className={utils.flexCenter} style={{ height: 60, background: 'var(--color-bg)' }}>
                flexCenter
              </div>
            </Group>
          </div>
        </Container>
      </Section>

      <Section tone="emerald">
        <Container gutter>
          <SectionHeader
            tone="emerald"
            eyebrow="On emerald"
            title="Inverted text on emerald"
            kicker="Eyebrow flips to brass on dark tones."
          />
        </Container>
      </Section>

      <Section tone="ink" dense>
        <Container gutter>
          <SectionHeader
            tone="ink"
            eyebrow="On ink (dense)"
            title="Reduced vertical padding"
            kicker="Dense reduces the section's vertical padding by ~33%."
          />
        </Container>
      </Section>
    </>
  );
}

export default KitchenSink;
