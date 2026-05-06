export const COUPON_STATUS_LABEL = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  disabled: 'Disabled',
  out_of_uses: 'Out of uses',
};

export const COUPON_STATUS_TONE = {
  active: 'success',
  scheduled: 'brass',
  expired: 'muted',
  disabled: 'error',
  out_of_uses: 'warning',
};

export default function computeCouponStatus(coupon, now = Date.now()) {
  if (!coupon) return 'disabled';
  if (!coupon.isActive) return 'disabled';
  const endsAt = coupon.endsAt ? Date.parse(coupon.endsAt) : NaN;
  const startsAt = coupon.startsAt ? Date.parse(coupon.startsAt) : NaN;
  if (Number.isFinite(endsAt) && endsAt < now) return 'expired';
  if (Number.isFinite(startsAt) && startsAt > now) return 'scheduled';
  const max = Number(coupon.maxRedemptions) || 0;
  const used = Number(coupon.redeemedCount) || 0;
  if (max > 0 && used >= max) return 'out_of_uses';
  return 'active';
}
