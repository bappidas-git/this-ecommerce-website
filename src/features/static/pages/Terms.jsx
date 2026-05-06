import Seo from '../../../components/common/Seo.jsx';
import useSettings from '../../../hooks/useSettings.js';
import LegalPage from './LegalPage.jsx';

const SEO_TITLE = 'Terms of Service — THIS Interiors';
const SEO_DESCRIPTION =
  'The terms that govern your use of the THIS Interiors website and your purchase of pieces from the studio.';

function Terms() {
  const { data: settings } = useSettings();
  const updatedAt = settings?.legal?.termsUpdatedAt;
  const contactEmail = settings?.legal?.contactEmail || settings?.general?.email;
  const companyName = settings?.legal?.companyName || 'THIS Interiors Trading LLC';
  const governingLaw = settings?.legal?.governingLaw || 'United Arab Emirates';

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance',
      body: (
        <>
          <p>
            By using this website or placing an order, you agree to these terms. If you do not agree, please do not use the site. We may update these terms from time to time; the date at the top reflects the latest version, and continued use of the site after a change means you accept the update.
          </p>
        </>
      ),
    },
    {
      id: 'account',
      title: 'Account',
      body: (
        <>
          <p>
            You can browse the studio without an account, but creating one helps with order tracking, returns, and the wishlist. You are responsible for keeping your password secure and for activity on your account. Tell us as soon as possible if you suspect unauthorised access.
          </p>
          <p>
            You must be at least 18 years old, or have a parent or guardian&rsquo;s consent, to place an order.
          </p>
        </>
      ),
    },
    {
      id: 'pricing-payment',
      title: 'Pricing & payment',
      body: (
        <>
          <p>
            Prices are shown in UAE Dirhams (AED) and include VAT where applicable. We try to keep listings accurate, but if a piece is mispriced we will contact you before processing the order and offer a refund or the corrected price.
          </p>
          <p>
            We accept major credit and debit cards, cash on delivery within the UAE, and bank transfer for larger orders. Payment is taken at the time of order. Bank transfer orders are reserved for 48 hours pending receipt.
          </p>
        </>
      ),
    },
    {
      id: 'orders-cancellation',
      title: 'Orders & cancellation',
      body: (
        <>
          <p>
            An order is confirmed when we send the order confirmation email. We reserve the right to cancel an order if a piece becomes unavailable, the price was clearly wrong, or we suspect fraud. Any payment taken for a cancelled order is refunded in full.
          </p>
          <p>
            You may cancel an order within two hours of placing it by emailing <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with the order number. After that window the order may already be packed and travelling.
          </p>
        </>
      ),
    },
    {
      id: 'returns',
      title: 'Returns',
      body: (
        <>
          <p>
            Most pieces can be returned within 14 days of delivery, unused and in their original packaging. Made‑to‑order and final‑sale pieces are not eligible. For full details please see our <a href="/shipping-returns">Shipping &amp; Returns</a> page.
          </p>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual property',
      body: (
        <>
          <p>
            All content on this site — including photographs, drawings, copy, the logo, and the visual identity — belongs to {companyName} or its licensors. You may not copy, reproduce, or use this content commercially without our written permission.
          </p>
          <p>
            Editorial reproduction with a credit to THIS Interiors is welcome.
          </p>
        </>
      ),
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of liability',
      body: (
        <>
          <p>
            To the extent permitted by law, our liability for any loss arising from the use of this website or the purchase of a piece is limited to the price paid for that piece. We do not exclude or limit liability for fraud, death, or personal injury caused by negligence.
          </p>
        </>
      ),
    },
    {
      id: 'governing-law',
      title: 'Governing law',
      body: (
        <>
          <p>
            These terms are governed by the laws of the {governingLaw}, and any dispute will be settled in the courts of Dubai. Where you are a consumer, this does not affect your rights under the laws of the country where you live.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <>
          <p>
            Questions? Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>, or write to {companyName}, Studio 14, Alserkal Avenue, Al Quoz 1, Dubai, UAE.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <Seo title={SEO_TITLE} description={SEO_DESCRIPTION} />
      <LegalPage
        eyebrow="Policies"
        title="Terms of Service"
        kicker="The rules that apply when you browse the site or buy from the studio."
        updatedAt={updatedAt}
        sections={sections}
      />
    </>
  );
}

export default Terms;
