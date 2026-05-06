import Seo from '../../../components/common/Seo.jsx';
import useSettings from '../../../hooks/useSettings.js';
import LegalPage from './LegalPage.jsx';

import styles from './LegalPage.module.css';

const SEO_TITLE = 'Shipping & Returns — THIS Interiors';
const SEO_DESCRIPTION =
  'UAE delivery, free shipping over AED 500, our 14‑day returns window, and what happens if a piece arrives damaged.';

function ShippingReturns() {
  const { data: settings } = useSettings();
  const updatedAt = settings?.legal?.shippingUpdatedAt;
  const contactEmail = settings?.legal?.contactEmail || settings?.general?.email;

  const cards = (
    <div className={styles.cards}>
      <div className={styles.card}>
        <p className={styles.cardEyebrow}>Free local delivery</p>
        <h3 className={styles.cardTitle}>On UAE orders over AED 500</h3>
        <p className={styles.cardKicker}>
          Hand‑packed in the studio and dispatched within 1–3 working days.
        </p>
      </div>
      <div className={styles.card}>
        <p className={styles.cardEyebrow}>Hassle‑free returns</p>
        <h3 className={styles.cardTitle}>14‑day return window</h3>
        <p className={styles.cardKicker}>
          Send most pieces back within 14 days of delivery for a full refund.
        </p>
      </div>
    </div>
  );

  const sections = [
    {
      id: 'delivery-uae',
      title: 'Delivery within the UAE',
      body: (
        <>
          <p>
            Every order leaves our Al Quoz studio packed by hand in protective tissue and recyclable kraft. We ship across all seven emirates with a trusted local courier. You will receive an email with a tracking link the moment the parcel is collected.
          </p>
          <p>
            Smaller pieces travel with our standard courier. Larger furniture is delivered by our own white‑glove team in Dubai and Abu Dhabi, by appointment.
          </p>
        </>
      ),
    },
    {
      id: 'delivery-times',
      title: 'Delivery times',
      body: (
        <>
          <ul>
            <li>
              <strong>Dubai:</strong> 1–3 working days.
            </li>
            <li>
              <strong>Other emirates:</strong> 2–4 working days.
            </li>
            <li>
              <strong>GCC:</strong> 4–7 working days.
            </li>
            <li>
              <strong>Made‑to‑order:</strong> as noted on each product page (typically 3–6 weeks).
            </li>
          </ul>
          <p>
            Working days are Monday to Friday. Orders placed after 2pm or on weekends are processed the next working day.
          </p>
        </>
      ),
    },
    {
      id: 'free-shipping',
      title: 'Free shipping threshold',
      body: (
        <>
          <p>
            We deliver free of charge anywhere in the UAE on orders over <strong>AED 500</strong>. Below that, standard UAE delivery is a flat <strong>AED 25</strong>. The free shipping threshold applies after any discounts and before VAT.
          </p>
        </>
      ),
    },
    {
      id: 'returns-window',
      title: 'Returns window',
      body: (
        <>
          <p>
            You can return most pieces within <strong>14 days</strong> of delivery, in original packaging and unused condition. Made‑to‑order and final‑sale items, and items marked as last pieces, are not eligible.
          </p>
          <p>
            To start a return, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with your order number. We will send a courier within 2 working days within the UAE. For change‑of‑mind returns, AED 25 is deducted from your refund.
          </p>
        </>
      ),
    },
    {
      id: 'damaged',
      title: 'Damaged in transit',
      body: (
        <>
          <p>
            Every piece is inspected before it leaves the studio, but accidents happen in transit. If anything arrives damaged, please email us within 48 hours of delivery with your order number and a couple of photos.
          </p>
          <p>
            We will arrange a free courier collection and either replace the piece or issue a full refund — whichever you prefer.
          </p>
        </>
      ),
    },
    {
      id: 'refund-timing',
      title: 'Refund timing',
      body: (
        <>
          <p>
            Refunds are issued to your original payment method within <strong>5–7 working days</strong> of the piece arriving back at the studio. For bank transfer orders, please reply to the order confirmation email with your IBAN so we can issue the refund.
          </p>
          <p>
            You will receive an email confirmation as soon as the refund is processed. Banks can sometimes take a further 1–2 working days to reflect it on your statement.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <Seo title={SEO_TITLE} description={SEO_DESCRIPTION} />
      <LegalPage
        eyebrow="Logistics"
        title="Shipping & Returns"
        kicker="Delivery, returns, and what to do if a piece arrives damaged."
        updatedAt={updatedAt}
        topSlot={cards}
        sections={sections}
      />
    </>
  );
}

export default ShippingReturns;
