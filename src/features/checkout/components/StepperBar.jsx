import { useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCheckout, STEP_INDEX } from '../../../context/CheckoutContext.jsx';
import styles from './StepperBar.module.css';

const STEPS = [
  { id: STEP_INDEX.address, label: 'Address' },
  { id: STEP_INDEX.payment, label: 'Payment' },
  { id: STEP_INDEX.review, label: 'Review' },
];

function pathToStep(pathname) {
  if (pathname.includes('/payment')) return 2;
  if (pathname.includes('/review')) return 3;
  if (pathname.includes('/confirmation')) return 3;
  return 1;
}

function StepperBar() {
  const { goToStep, isAddressValid, isPaymentValid } = useCheckout();
  const { pathname } = useLocation();
  const current = pathToStep(pathname);
  const isConfirmation = pathname.includes('/confirmation');

  const stateOf = (id) => {
    if (isConfirmation) return 'completed';
    if (id < current) return 'completed';
    if (id === current) return 'active';
    return 'future';
  };

  const handleClick = (id) => {
    if (id >= current) return;
    if (id === 2 && !isAddressValid()) return;
    if (id === 3 && (!isAddressValid() || !isPaymentValid())) return;
    goToStep(id);
  };

  return (
    <>
      <nav className={styles.bar} aria-label="Checkout progress">
        <ol className={styles.list}>
          {STEPS.map((step, idx) => {
            const status = stateOf(step.id);
            const isClickable = status === 'completed';
            return (
              <li key={step.id} className={styles.item} data-status={status}>
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => handleClick(step.id)}
                  disabled={!isClickable}
                  aria-current={status === 'active' ? 'step' : undefined}
                >
                  <span className={styles.circle} aria-hidden>
                    {status === 'completed' ? <Check size={14} strokeWidth={2.5} /> : step.id}
                  </span>
                  <span className={styles.label}>{step.label}</span>
                </button>
                {idx < STEPS.length - 1 ? (
                  <span className={styles.connector} aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className={styles.dots} role="presentation" aria-hidden>
        {STEPS.map((step) => (
          <span
            key={step.id}
            className={styles.dot}
            data-status={stateOf(step.id)}
          />
        ))}
      </div>
    </>
  );
}

export default StepperBar;
