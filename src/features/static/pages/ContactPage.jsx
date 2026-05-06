import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import Eyebrow from '../../../components/common/Eyebrow.jsx';
import SectionHeader from '../../../components/common/SectionHeader.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import AppSelect from '../../../components/common/AppSelect/AppSelect.jsx';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Seo from '../../../components/common/Seo.jsx';
import { contactService } from '../../../api/services/contactService.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useSettings from '../../../hooks/useSettings.js';
import { PATHS } from '../../../routes/paths.js';

import styles from './ContactPage.module.css';

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'order', label: 'Order help' },
  { value: 'press', label: 'Press' },
  { value: 'trade', label: 'Trade' },
];

const FAQ_RAIL = [
  {
    q: 'How long does shipping take?',
    a: 'UAE orders ship within 2–4 working days. GCC and international timelines vary by destination — see Shipping & Returns for details.',
  },
  {
    q: 'Can I return a piece if it does not work in my room?',
    a: 'Yes, within 14 days of delivery for most pieces. Made‑to‑order items are final sale.',
  },
  {
    q: 'Do you take trade and styling enquiries?',
    a: 'Often, yes. Use the form on this page and select Trade as the subject — we will reply within a couple of business days.',
  },
];

const schema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required('Please share your name.')
      .min(2, 'Please share your full name.'),
    email: yup
      .string()
      .trim()
      .required('Please share an email so we can reply.')
      .email("That email doesn't look right."),
    subject: yup
      .string()
      .oneOf(SUBJECT_OPTIONS.map((o) => o.value))
      .required('Please choose a subject.'),
    orderNumber: yup
      .string()
      .trim()
      .max(40, 'Order number is too long.')
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    message: yup
      .string()
      .trim()
      .required('Please write a short message.')
      .min(10, 'A few more words please — at least 10 characters.')
      .max(1000, 'Please keep messages under 1,000 characters.'),
    acceptsContact: yup
      .boolean()
      .oneOf([true], 'We need your consent to reply.')
      .required(),
  })
  .required();

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] },
};

function ContactPage() {
  const [searchParams] = useSearchParams();
  const { data: settings } = useSettings();
  const general = settings?.general || {};

  const address = general.address || 'Dubai, United Arab Emirates';
  const email = general.email || 'studio@thisinteriors.com';
  const phone = general.phone || '+971 4 000 0000';
  const hours = Array.isArray(general.openingHours) ? general.openingHours : [];
  const mapEmbedUrl =
    general.mapEmbedUrl ||
    'https://www.google.com/maps?q=Dubai,+United+Arab+Emirates&output=embed';

  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);

  const defaultValues = {
    name: '',
    email: '',
    subject: 'general',
    orderNumber: searchParams.get('orderNumber') || '',
    message: '',
    acceptsContact: false,
  };

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  });
  const { handleSubmit, formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await contactService.send({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject,
        orderNumber: values.orderNumber ? values.orderNumber.trim() : null,
        message: values.message.trim(),
        acceptsContact: values.acceptsContact === true,
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(getApiErrorMessage(err) || 'Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setServerError(null);
    setSubmitted(false);
  };

  return (
    <>
      <Seo
        title="Contact | THIS Interiors"
        description="Write to the THIS Interiors studio in Dubai — for orders, press, trade or simply to say hello."
      >
        <meta property="og:title" content="Contact | THIS Interiors" />
        <meta
          property="og:description"
          content="Write to the THIS Interiors studio in Dubai — replies within 1–2 business days."
        />
        <meta
          property="og:image"
          content="https://placehold.co/1200x630/F7F3ED/1B1A17?text=Contact+THIS&font=cormorant"
        />
      </Seo>

      <Section tone="cream" aria-labelledby="contact-title">
        <Container gutter>
          <motion.div className={styles.intro} {...fadeUp}>
            <Eyebrow color="brass">Contact</Eyebrow>
            <h1 id="contact-title" className={styles.introTitle}>
              Write to the studio.
            </h1>
            <p className={styles.introKicker}>
              We read every note. For orders and trade enquiries, the form on the right is fastest — we reply within 1–2 business days.
            </p>
          </motion.div>

          <div className={styles.layout}>
            {/* LEFT — info card */}
            <motion.aside className={styles.infoCard} aria-label="Studio details" {...fadeUp}>
              <h2 className={styles.infoTitle}>The studio</h2>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Address</p>
                <p className={styles.infoValue}>{address}</p>
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Phone</p>
                <p className={styles.infoValue}>
                  <a className={styles.infoLink} href={`tel:${phone.replace(/\s+/g, '')}`}>
                    {phone}
                  </a>
                </p>
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>
                  <a className={styles.infoLink} href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              </div>

              {hours.length > 0 ? (
                <div className={styles.infoBlock}>
                  <p className={styles.infoLabel}>Opening hours</p>
                  <ul className={styles.hours}>
                    {hours.map((row) => (
                      <li key={row.label} className={styles.hoursRow}>
                        <span>{row.label}</span>
                        <span>{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <iframe
                title="Map of THIS Interiors studio"
                src={mapEmbedUrl}
                className={styles.mapFrame}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </motion.aside>

            {/* RIGHT — form / confirmation */}
            <div>
              {submitted ? (
                <motion.div
                  className={styles.confirmationCard}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.6, 0.2, 1] }}
                  role="status"
                  aria-live="polite"
                >
                  <Eyebrow color="brass">Thank you</Eyebrow>
                  <h2 className={styles.confirmationTitle}>Message received.</h2>
                  <p className={styles.confirmationKicker}>
                    We&apos;ll reply within 1–2 business days. If your note is about a recent order, we&apos;ll loop in the right person on the studio team.
                  </p>
                  <button type="button" className={styles.resetLink} onClick={handleReset}>
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.div className={styles.formCard} {...fadeUp}>
                  <h2 className={styles.formTitle}>Send a note</h2>
                  <p className={styles.formKicker}>
                    A few details so we can reply with care. Required fields are marked.
                  </p>

                  {serverError ? (
                    <Alert severity="error" className={styles.serverError}>
                      {serverError}
                    </Alert>
                  ) : null}

                  <FormProvider {...methods}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                      <div className={styles.formGrid}>
                        <div>
                          <AppTextField name="name" label="Your name" autoComplete="name" />
                        </div>
                        <div>
                          <AppTextField
                            name="email"
                            label="Email"
                            type="email"
                            autoComplete="email"
                          />
                          <p className={styles.fieldNote}>
                            We only use this to reply to you.
                          </p>
                        </div>
                        <div>
                          <AppSelect
                            id="contact-subject"
                            name="subject"
                            label="Subject"
                            options={SUBJECT_OPTIONS}
                          />
                        </div>
                        <div>
                          <AppTextField
                            name="orderNumber"
                            label="Order number"
                            optional
                          />
                          <p className={styles.fieldNote}>
                            If your note is about an order, this helps us find it faster.
                          </p>
                        </div>
                        <div className={styles.fullRow}>
                          <AppTextField
                            name="message"
                            label="Message"
                            multiline
                            minRows={5}
                            inputProps={{ maxLength: 1000 }}
                          />
                          <p className={styles.fieldNote}>
                            10–1,000 characters. Plain words are perfect.
                          </p>
                        </div>
                        <div className={styles.fullRow}>
                          <AppCheckbox
                            name="acceptsContact"
                            label="I’m happy for the studio to reply to this message."
                          />
                          <p className={styles.fieldNote}>
                            We will not add you to any newsletter from this form.
                          </p>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <AppButton
                          type="submit"
                          variant="primary"
                          size="large"
                          loading={isSubmitting}
                        >
                          Send message
                        </AppButton>
                      </div>
                    </form>
                  </FormProvider>
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ RAIL */}
      <Section tone="surface" dense aria-labelledby="contact-faq-title">
        <Container gutter>
          <SectionHeader
            id="contact-faq-title"
            eyebrow="Quick answers"
            title="Before you write, a few common questions."
            tone="surface"
          />
          <div className={styles.faqRail} style={{ marginTop: 24 }}>
            {FAQ_RAIL.map((item) => (
              <Accordion key={item.q} disableGutters elevation={0} square>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {item.q}
                </AccordionSummary>
                <AccordionDetails>{item.a}</AccordionDetails>
              </Accordion>
            ))}
            <Link to={PATHS.faq} className={styles.faqLink}>
              Read the full FAQ →
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default ContactPage;
