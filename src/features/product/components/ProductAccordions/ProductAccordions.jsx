import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Chip from '../../../../components/common/Chip/Chip.jsx';

import styles from './ProductAccordions.module.css';

const SHIPPING_COPY = {
  shipping:
    'Pieces ship from our Dubai studio in protective packaging within 2–4 working days inside the UAE. International orders take 7–14 working days.',
  returns:
    'Returns are accepted on unused pieces within 14 days of delivery. Made-to-order items and final-sale pieces are not eligible.',
};

function paragraphs(text) {
  if (typeof text !== 'string') return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function asMaterialList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function ProductAccordions({ product }) {
  const [expanded, setExpanded] = useState('details');

  if (!product) return null;

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const desc = paragraphs(product.description);
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const attributes = product.attributes || {};
  const colors = asMaterialList(attributes.color);
  const materials = asMaterialList(attributes.material);
  const care = asMaterialList(attributes.care);
  const dimensions = attributes.dimensions || null;
  const weight = attributes.weight || null;

  const dimensionEntries = [
    dimensions ? { label: 'Dimensions', value: dimensions } : null,
    weight ? { label: 'Weight', value: weight } : null,
    product.sku ? { label: 'SKU', value: product.sku } : null,
  ].filter(Boolean);

  const renderPanel = ({ id, title, children }) => (
    <Accordion
      key={id}
      expanded={expanded === id}
      onChange={handleChange(id)}
      disableGutters
      square
      className={styles.accordion}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        className={styles.summary}
      >
        <span className={styles.title}>{title}</span>
      </AccordionSummary>
      <AccordionDetails className={styles.details}>{children}</AccordionDetails>
    </Accordion>
  );

  return (
    <section className={styles.root} aria-label="Product information">
      {renderPanel({
        id: 'details',
        title: 'Details',
        children: (
          <div className={styles.detailsBody}>
            {desc.length > 0 ? (
              desc.map((p, i) => (
                <p key={`p-${i}`} className={styles.paragraph}>
                  {p}
                </p>
              ))
            ) : (
              <p className={styles.paragraph}>No description available yet.</p>
            )}
            {tags.length > 0 ? (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="soft" size="small" />
                ))}
              </div>
            ) : null}
          </div>
        ),
      })}

      {renderPanel({
        id: 'materials',
        title: 'Materials & Care',
        children: (
          <dl className={styles.kv}>
            {colors.length > 0 ? (
              <>
                <dt>Colour</dt>
                <dd>{colors.join(', ')}</dd>
              </>
            ) : null}
            {materials.length > 0 ? (
              <>
                <dt>Material</dt>
                <dd>{materials.join(', ')}</dd>
              </>
            ) : null}
            {care.length > 0 ? (
              <>
                <dt>Care</dt>
                <dd>{care.join(', ')}</dd>
              </>
            ) : (
              <>
                <dt>Care</dt>
                <dd>
                  Wipe with a soft, dry cloth. Avoid harsh detergents and prolonged direct sunlight.
                </dd>
              </>
            )}
            {colors.length === 0 && materials.length === 0 ? (
              <p className={styles.paragraph}>Materials information is being prepared.</p>
            ) : null}
          </dl>
        ),
      })}

      {renderPanel({
        id: 'dimensions',
        title: 'Dimensions',
        children:
          dimensionEntries.length > 0 ? (
            <dl className={styles.kv}>
              {dimensionEntries.map((entry) => (
                <span key={entry.label} className={styles.kvRow}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </span>
              ))}
            </dl>
          ) : (
            <p className={styles.paragraph}>Dimensions are not listed for this piece.</p>
          ),
      })}

      {renderPanel({
        id: 'shipping',
        title: 'Shipping & Returns',
        children: (
          <div className={styles.detailsBody}>
            <p className={styles.paragraph}>{SHIPPING_COPY.shipping}</p>
            <p className={styles.paragraph}>{SHIPPING_COPY.returns}</p>
          </div>
        ),
      })}
    </section>
  );
}

export default ProductAccordions;
