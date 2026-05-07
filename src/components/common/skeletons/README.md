# Skeletons

Editorial loading placeholders that mirror the resolved layout so the page does
not shift when data arrives.

## Convention

- A skeleton **must** mirror the final layout dimensions to within ±2px so the
  Cumulative Layout Shift (CLS) on data resolution is effectively zero.
- Never use `<CircularProgress>` (or any spinner) as a screen-level loader. Use
  these primitives or a layout-mirrored composite skeleton.
- Prefer composing screen-level skeletons from these primitives rather than
  introducing one-off shimmer styles.
- All shimmer animations are `1.4s linear infinite` — brass at 6% opacity over
  `--color-line`. Defined once in `Skeleton.module.css`.
- Respects `prefers-reduced-motion`: the shimmer is paused for users who opt
  out of motion.

## Primitives

```jsx
import { RectSkeleton, TextSkeleton } from '@/components/common/skeletons';

// A rectangle. w/h accept numbers (px) or any CSS length string.
// r is the border radius (px or string).
<RectSkeleton w="100%" h={240} r={14} />

// Multi-line text block. The last line is rendered shorter to mimic copy.
<TextSkeleton lines={3} />
```

## Timing

Use `useDeferredLoading(isLoading, delay = 120)` in screens where data
typically resolves quickly (mini cart, wishlist counts, etc). The skeleton
only flips on if the request takes longer than `delay`, preventing a visible
flash on fast loads.

```jsx
import useDeferredLoading from '@/hooks/useDeferredLoading.js';

const showSkeleton = useDeferredLoading(isLoading);
return showSkeleton ? <SectionSkeleton /> : <SectionContent />;
```
