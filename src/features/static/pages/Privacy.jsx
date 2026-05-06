import Seo from '../../../components/common/Seo.jsx';
import useSettings from '../../../hooks/useSettings.js';
import LegalPage from './LegalPage.jsx';

const SEO_TITLE = 'Privacy Policy — THIS Interiors';
const SEO_DESCRIPTION =
  'How THIS Interiors collects, uses, and protects your personal information. Read our privacy policy.';

function Privacy() {
  const { data: settings } = useSettings();
  const updatedAt = settings?.legal?.privacyUpdatedAt;
  const contactEmail = settings?.legal?.contactEmail || settings?.general?.email;

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      body: (
        <>
          <p>
            THIS Interiors (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates from Dubai, UAE, and provides editorial homewares through this website. This policy explains what personal information we collect when you visit, browse, or purchase from us, how we use it, and the rights you have over it.
          </p>
          <p>
            We aim to be transparent and to ask only for what we genuinely need to run the studio. If anything here is unclear, please reach out to <a href={`mailto:${contactEmail}`}>{contactEmail}</a> and we will explain it in plain language.
          </p>
        </>
      ),
    },
    {
      id: 'data-we-collect',
      title: 'Data we collect',
      body: (
        <>
          <p>We collect personal data in three ways:</p>
          <ul>
            <li>
              <strong>You give it to us</strong> — when you create an account, place an order, subscribe to the newsletter, or contact the studio. This typically includes name, email, phone, shipping address, and order details.
            </li>
            <li>
              <strong>Automatically</strong> — basic technical information when you browse, such as device type, browser, IP address (truncated), and pages viewed.
            </li>
            <li>
              <strong>From trusted partners</strong> — payment confirmations from our payment providers and delivery status from couriers.
            </li>
          </ul>
          <p>
            We never knowingly collect data from anyone under 16. If you believe a minor has shared data with us, please get in touch and we will remove it promptly.
          </p>
        </>
      ),
    },
    {
      id: 'how-we-use-it',
      title: 'How we use it',
      body: (
        <>
          <p>We use your information to:</p>
          <ul>
            <li>Process and deliver orders, and keep you informed of their status.</li>
            <li>Maintain your account, wishlist, and order history.</li>
            <li>Reply to enquiries and provide aftercare.</li>
            <li>Send the studio newsletter, only if you have opted in.</li>
            <li>Improve the site, fix bugs, and prevent fraud.</li>
            <li>Comply with legal and tax obligations in the UAE.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'sharing',
      title: 'Sharing',
      body: (
        <>
          <p>
            We do not sell your data. We share it only with the partners we need to run the studio: payment processors, courier and delivery services, our email and analytics tools, and our accountants. Each of these is bound by contract to use your data only on our instructions.
          </p>
          <p>
            We may also disclose information where required by UAE law, a court order, or to protect our legal rights.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies',
      body: (
        <>
          <p>
            We use a small number of cookies and similar technologies to remember your cart, keep you signed in, and understand which pages are most read. You can clear cookies from your browser at any time; some features (like staying signed in) will simply ask you to sign in again.
          </p>
          <p>
            We use a privacy‑friendly analytics tool that does not build advertising profiles or share data with third parties.
          </p>
        </>
      ),
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body: (
        <>
          <p>You have the right to:</p>
          <ul>
            <li>Ask for a copy of the personal data we hold about you.</li>
            <li>Correct anything inaccurate.</li>
            <li>Ask us to delete your data, where we are not legally required to keep it.</li>
            <li>Withdraw consent for marketing emails at any time, by clicking the unsubscribe link in any email.</li>
            <li>Object to or restrict certain uses of your data.</li>
          </ul>
          <p>
            To exercise any of these rights, write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We will respond within 30 days.
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
            For any privacy questions, please contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>, or write to THIS Interiors Trading LLC, Studio 14, Alserkal Avenue, Al Quoz 1, Dubai, UAE.
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
        title="Privacy Policy"
        kicker="How we collect, use, and protect the information you share with the studio."
        updatedAt={updatedAt}
        sections={sections}
      />
    </>
  );
}

export default Privacy;
