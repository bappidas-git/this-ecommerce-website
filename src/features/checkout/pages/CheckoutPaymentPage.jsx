import { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Seo from '../../../components/common/Seo.jsx';
import Loader from '../../../components/common/Loader/Loader.jsx';

import CardForm from '../components/CardForm.jsx';
import PaymentMethodCard from '../components/PaymentMethodCard.jsx';

import { useCheckout } from '../../../context/CheckoutContext.jsx';
import { useSettings } from '../../../hooks/useSettings.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useApiFormError from '../../../hooks/useApiFormError.js';
import useFocusFirstInvalid from '../../../hooks/useFocusFirstInvalid.js';
import { nameField } from '../../../utils/validators.js';

import { luhnCheck, isExpiryValid, lastFourOf, detectBrand } from '../components/cardUtils.js';

import styles from './CheckoutPaymentPage.module.css';

const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]{1,79}$/u;

const cardSchema = yup.object({
  cardNumber: yup
    .string()
    .transform((v) => String(v || '').replace(/\D+/g, ''))
    .required('Please enter your card number.')
    .test('length', 'Card number must be 13 to 19 digits.', (v) => {
      const len = (v || '').length;
      return len >= 13 && len <= 19;
    })
    .test('luhn', "That card number doesn't look right.", (v) => luhnCheck(v || '')),
  cardName: nameField({ label: 'name on card', min: 2, max: 80 }).matches(
    NAME_REGEX,
    'Use letters, spaces, hyphens or apostrophes only.',
  ),
  expiry: yup
    .string()
    .required('Please enter the expiry date.')
    .test('format', 'Use the MM/YY format.', (v) =>
      /^\d{2}\/\d{2}$|^\d{4}$/.test(String(v || '').trim()),
    )
    .test('not-expired', 'This card has expired.', (v) => isExpiryValid(v || '')),
  cvv: yup
    .string()
    .transform((v) => String(v || '').replace(/\D+/g, ''))
    .required('Please enter the security code.')
    .matches(/^\d{3,4}$/, 'The security code is 3 or 4 digits.'),
  saveCard: yup.boolean().default(false),
});

const notesSchema = yup.object({
  notes: yup.string().max(280, 'Please keep notes under 280 characters.').default(''),
});

const METHOD_VALUES = Object.freeze({
  card: 'card',
  cod: 'cod',
  bankTransfer: 'bankTransfer',
});

function buildCardDefaults(payment) {
  if (payment?.method !== 'card') {
    return { cardNumber: '', cardName: '', expiry: '', cvv: '', saveCard: false };
  }
  return {
    cardNumber: '',
    cardName: payment.cardName || '',
    expiry: payment.expiry || '',
    cvv: '',
    saveCard: Boolean(payment.saveCard),
  };
}

function CheckoutPaymentPage() {
  const checkout = useCheckout();
  const { data: settings } = useSettings();
  const payment = settings?.payment || {};

  const enabledMethods = useMemo(() => {
    const list = [];
    if (payment.cardEnabled) list.push(METHOD_VALUES.card);
    if (payment.codEnabled) list.push(METHOD_VALUES.cod);
    if (payment.bankTransferEnabled) list.push(METHOD_VALUES.bankTransfer);
    return list;
  }, [payment.cardEnabled, payment.codEnabled, payment.bankTransferEnabled]);

  // Hydrate from CheckoutContext on first render; user clicks override after.
  const [selectedMethod, setSelectedMethod] = useState(
    () => checkout.payment?.method || null,
  );

  // Effective method falls back to the first enabled option whenever the
  // current pick is missing or no longer valid for the active settings.
  const effectiveMethod =
    selectedMethod && enabledMethods.includes(selectedMethod)
      ? selectedMethod
      : enabledMethods[0] || null;

  const cardForm = useForm({
    resolver: yupResolver(cardSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildCardDefaults(checkout.payment),
  });

  const notesForm = useForm({
    resolver: yupResolver(notesSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { notes: checkout.notes || '' },
  });

  const [serverErrors, setServerErrors] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCardApiError = useApiFormError(cardForm);
  useFocusFirstInvalid(cardForm, ['cardNumber', 'cardName', 'expiry', 'cvv']);
  useFocusFirstInvalid(notesForm, ['notes']);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    setServerErrors(null);
    setIsSubmitting(true);
    try {
      const notesValid = await notesForm.trigger();
      const notesValue = notesForm.getValues('notes') || '';
      if (!notesValid) {
        setIsSubmitting(false);
        return;
      }

      let payload = null;

      if (effectiveMethod === METHOD_VALUES.card) {
        const valid = await cardForm.trigger(undefined, { shouldFocus: true });
        if (!valid) {
          setIsSubmitting(false);
          return;
        }
        const values = cardForm.getValues();
        const last4 = lastFourOf(values.cardNumber);
        const brand = detectBrand(values.cardNumber);
        payload = {
          method: 'card',
          brand: brand || 'card',
          last4,
          cardName: values.cardName.trim(),
          expiry: values.expiry,
          saveCard: Boolean(values.saveCard),
          paymentStatus: 'authorised',
          // The full PAN/CVV intentionally never reaches the context — only
          // the masked last 4 are persisted for the Review step.
        };
      } else if (effectiveMethod === METHOD_VALUES.cod) {
        payload = {
          method: 'cod',
          fee: Number(payment.codFee) || 0,
          currency: payment.currency || 'AED',
          paymentStatus: 'pending',
        };
      } else if (effectiveMethod === METHOD_VALUES.bankTransfer) {
        payload = {
          method: 'bankTransfer',
          paymentStatus: 'pending',
          bankDetailsSnapshot: payment.bankDetails || null,
        };
      } else {
        setSubmitError('Please choose a payment method.');
        setIsSubmitting(false);
        return;
      }

      checkout.setPayment(payload);
      checkout.setNotes(notesValue);
      checkout.goNext();
    } catch (err) {
      const data = err?.errors;
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setServerErrors(data);
        if (effectiveMethod === METHOD_VALUES.card) onCardApiError(err);
      }
      setSubmitError(getApiErrorMessage(err) || 'Could not save payment details.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    cardForm,
    notesForm,
    effectiveMethod,
    checkout,
    payment.codFee,
    payment.currency,
    payment.bankDetails,
    onCardApiError,
  ]);

  if (enabledMethods.length === 0) {
    return (
      <>
        <Seo title="Checkout — Payment | THIS Interiors" noindex />
        <div className={styles.page}>
          <header className={styles.sectionHeader}>
            <span className={styles.kicker}>All transactions are encrypted.</span>
            <h1 className={styles.title}>Payment</h1>
          </header>
          <div className={styles.errorBanner} role="alert">
            No payment methods are currently available. Please contact us to complete your order.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title="Checkout — Payment | THIS Interiors" noindex />

      <div className={styles.page}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker}>All transactions are encrypted.</span>
          <h1 className={styles.title}>Payment</h1>
        </header>

        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            {submitError}
          </div>
        ) : null}

        <section className={styles.methods} aria-labelledby="payment-methods-heading">
          <h2 id="payment-methods-heading" className={styles.srOnly}>
            Payment methods
          </h2>

          {enabledMethods.includes(METHOD_VALUES.card) ? (
            <PaymentMethodCard
              value={METHOD_VALUES.card}
              name="payment-method"
              selected={effectiveMethod === METHOD_VALUES.card}
              onSelect={setSelectedMethod}
              title="Credit or debit card"
              description="Visa, Mastercard, Amex"
              icon={<CardBrandIcons />}
            >
              <FormProvider {...cardForm}>
                <CardForm idPrefix="card-" serverErrors={serverErrors} />
              </FormProvider>
            </PaymentMethodCard>
          ) : null}

          {enabledMethods.includes(METHOD_VALUES.cod) ? (
            <PaymentMethodCard
              value={METHOD_VALUES.cod}
              name="payment-method"
              selected={effectiveMethod === METHOD_VALUES.cod}
              onSelect={setSelectedMethod}
              title="Cash on Delivery"
              description="Pay your courier when your order arrives."
              meta={
                payment.codFee
                  ? `+${payment.currency || 'AED'} ${Number(payment.codFee).toFixed(2)}`
                  : null
              }
            >
              <p className={styles.note}>
                Pay in cash to our courier on delivery.
                {payment.codFee
                  ? ` A small handling fee of ${payment.currency || 'AED'} ${Number(payment.codFee).toFixed(2)} applies.`
                  : ''}
              </p>
            </PaymentMethodCard>
          ) : null}

          {enabledMethods.includes(METHOD_VALUES.bankTransfer) ? (
            <PaymentMethodCard
              value={METHOD_VALUES.bankTransfer}
              name="payment-method"
              selected={effectiveMethod === METHOD_VALUES.bankTransfer}
              onSelect={setSelectedMethod}
              title="Bank transfer"
              description="Wire the order total to our studio account."
              meta="Held until paid"
            >
              <BankTransferDetails details={payment.bankDetails} />
            </PaymentMethodCard>
          ) : null}
        </section>

        <FormProvider {...notesForm}>
          <section className={styles.notesSection} aria-labelledby="notes-heading">
            <div className={styles.sectionHeader}>
              <h2 id="notes-heading" className={styles.subhead}>
                Order notes
              </h2>
              <p className={styles.subtitle}>
                Anything we should know? Gift wrap requests, delivery preferences, etc.
              </p>
            </div>
            <NotesField />
          </section>
        </FormProvider>

        <div className={styles.footer}>
          <AppButton
            variant="ghost"
            onClick={checkout.goPrev}
            className={styles.ghostBtn}
            disabled={isSubmitting}
          >
            Back to address
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            className={styles.primaryBtn}
          >
            Review order
          </AppButton>
        </div>

        {isSubmitting ? (
          <div className={styles.loaderOverlay} aria-hidden>
            <Loader label="Saving…" />
          </div>
        ) : null}
      </div>
    </>
  );
}

function NotesField() {
  const { register, formState, watch } = useFormContext();
  const value = watch('notes') || '';
  const error = formState.errors?.notes?.message;
  return (
    <div className={styles.notesField}>
      <textarea
        {...register('notes')}
        id="checkout-notes"
        className={styles.textarea}
        placeholder="Add a note for our team…"
        maxLength={280}
        rows={3}
        aria-describedby="checkout-notes-help"
        aria-invalid={Boolean(error) || undefined}
      />
      <div className={styles.notesMeta} id="checkout-notes-help">
        <span className={error ? styles.notesError : styles.notesHint}>
          {error || 'Optional — visible to our studio team only.'}
        </span>
        <span className={styles.notesCount}>{value.length}/280</span>
      </div>
    </div>
  );
}

function CardBrandIcons() {
  return (
    <span className={styles.brandIconRow} aria-hidden>
      <span className={`${styles.brandIcon} ${styles.brandIconVisa}`}>VISA</span>
      <span className={`${styles.brandIcon} ${styles.brandIconMc}`}>MC</span>
      <span className={`${styles.brandIcon} ${styles.brandIconAmex}`}>AMEX</span>
    </span>
  );
}

function BankTransferDetails({ details }) {
  if (!details) {
    return (
      <p className={styles.note}>
        We&apos;ll email transfer instructions after you place your order.
      </p>
    );
  }
  const rows = [
    ['Bank', details.bankName],
    ['Account name', details.accountName],
    ['Account number', details.accountNumber],
    ['IBAN', details.iban],
    ['SWIFT/BIC', details.swift],
  ].filter(([, v]) => Boolean(v));

  return (
    <div className={styles.bankBlock}>
      <p className={styles.note}>
        Transfer the order total using the details below. Your order is held as
        <em> pending</em> until we receive payment (usually within 1–2 business days).
      </p>
      <dl className={styles.bankList}>
        {rows.map(([label, value]) => (
          <div className={styles.bankRow} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {details.reference ? (
        <p className={styles.bankReference}>{details.reference}</p>
      ) : null}
    </div>
  );
}

export default CheckoutPaymentPage;
