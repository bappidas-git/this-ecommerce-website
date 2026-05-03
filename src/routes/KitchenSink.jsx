import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InboxIcon from '@mui/icons-material/Inbox';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import Section from '../components/common/Section.jsx';
import Container from '../components/common/Container.jsx';
import Eyebrow from '../components/common/Eyebrow.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import PriceTag from '../components/common/PriceTag.jsx';

import {
  AppBadge,
  AppButton,
  AppCheckbox,
  AppDialog,
  AppDrawer,
  AppIconButton,
  AppRadioGroup,
  AppSelect,
  AppSwitch,
  AppTextField,
  Breadcrumbs,
  Chip,
  EmptyState,
  ErrorState,
  Loader,
  QuantityStepper,
  Rating,
  SkeletonCard,
} from '../components/common';

import utils from '../styles/utilities.module.css';

function Group({ title, children }) {
  return (
    <div className={utils.stack} style={{ gap: 16 }}>
      <Eyebrow color="brass">{title}</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {children}
      </div>
      <hr className={utils.divider} />
    </div>
  );
}

function Stack({ children }) {
  return (
    <div className={utils.stack} style={{ gap: 12, width: '100%' }}>
      {children}
    </div>
  );
}

function FormDemo() {
  const methods = useForm({
    defaultValues: {
      email: '',
      country: '',
      newsletter: true,
      delivery: 'standard',
      darkMode: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((vals) => console.log('demo', vals))}
        style={{ display: 'grid', gap: 16 }}
      >
        <AppTextField
          name="email"
          label="Email"
          description="We will never share your email."
          rules={{ required: 'Email is required' }}
        />
        <AppTextField name="phone" label="Phone" optional />
        <AppSelect
          name="country"
          label="Country"
          placeholder="Select a country"
          options={[
            { value: 'ae', label: 'United Arab Emirates' },
            { value: 'sa', label: 'Saudi Arabia' },
            { value: 'uk', label: 'United Kingdom' },
          ]}
        />
        <AppCheckbox name="newsletter" label="Subscribe to the newsletter" />
        <AppRadioGroup
          name="delivery"
          label="Delivery"
          row
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'express', label: 'Express' },
            { value: 'pickup', label: 'In‑store pickup' },
          ]}
        />
        <AppSwitch name="darkMode" label="Use dark mode" />
        <div style={{ display: 'flex', gap: 12 }}>
          <AppButton type="submit" variant="primary">
            Submit
          </AppButton>
          <AppButton type="button" variant="secondary" onClick={() => methods.reset()}>
            Reset
          </AppButton>
        </div>
      </form>
    </FormProvider>
  );
}

function KitchenSink() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chipSelected, setChipSelected] = useState('all');
  const [qty, setQty] = useState(1);

  return (
    <>
      <Section tone="cream">
        <Container gutter>
          <SectionHeader
            eyebrow="Kitchen Sink"
            title="Editorial primitives preview"
            kicker="A development-only canvas to verify every common UI primitive in all its variants."
            cta={<AppButton variant="primary" icon={<ArrowForwardIcon />} iconPosition="end">Primary CTA</AppButton>}
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container gutter>
          <div className={utils.stack} style={{ gap: 32 }}>

            <Group title="AppButton / variants">
              <AppButton variant="primary">Primary</AppButton>
              <AppButton variant="secondary">Secondary</AppButton>
              <AppButton variant="ghost">Ghost</AppButton>
              <AppButton variant="danger">Danger</AppButton>
              <AppButton variant="primary" loading>Loading</AppButton>
              <AppButton variant="primary" disabled>Disabled</AppButton>
              <AppButton variant="primary" icon={<SearchIcon />}>With icon</AppButton>
              <AppButton variant="secondary" icon={<ArrowForwardIcon />} iconPosition="end">End icon</AppButton>
              <AppButton variant="primary" to="/shop">Router link</AppButton>
              <AppButton variant="primary" size="small">Small</AppButton>
              <AppButton variant="primary" size="large">Large</AppButton>
              <AppButton variant="primary" fullWidth>Full width</AppButton>
            </Group>

            <Group title="AppIconButton">
              <AppIconButton aria-label="Search"><SearchIcon /></AppIconButton>
              <AppIconButton tooltip="Add to wishlist"><FavoriteBorderIcon /></AppIconButton>
              <AppIconButton tooltip="Disabled" disabled><FavoriteBorderIcon /></AppIconButton>
              <AppIconButton aria-label="Small" size="small"><SearchIcon fontSize="small" /></AppIconButton>
              <AppIconButton aria-label="Large" size="large"><SearchIcon /></AppIconButton>
            </Group>

            <Group title="AppBadge">
              <AppBadge variant="new" />
              <AppBadge variant="sale" />
              <AppBadge variant="limited" />
              <AppBadge variant="low-stock" />
              <AppBadge variant="sold-out" />
              <AppBadge variant="new">Just dropped</AppBadge>
            </Group>

            <Group title="Chip / variants">
              <Chip variant="solid" label="Solid" />
              <Chip variant="soft" label="Soft" />
              <Chip variant="outline" label="Outline" />
              <Chip
                variant="outline"
                label="All"
                selected={chipSelected === 'all'}
                onClick={() => setChipSelected('all')}
              />
              <Chip
                variant="outline"
                label="Vases"
                selected={chipSelected === 'vases'}
                onClick={() => setChipSelected('vases')}
              />
              <Chip
                variant="outline"
                label="Lighting"
                selected={chipSelected === 'lighting'}
                onClick={() => setChipSelected('lighting')}
              />
            </Group>

            <Group title="Rating">
              <Rating size="sm" value={4} />
              <Rating size="md" value={3.5} />
              <Rating size="md" value={5} max={5} />
              <Rating
                size="md"
                value={4}
                onChange={(v) => console.log('rated', v)}
                ariaLabel="Editable rating"
              />
            </Group>

            <Group title="QuantityStepper">
              <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />
              <QuantityStepper value={1} min={1} disabled />
            </Group>

            <Group title="Breadcrumbs">
              <Breadcrumbs
                items={[
                  { label: 'Home', to: '/' },
                  { label: 'Shop', to: '/shop' },
                  { label: 'Decor' },
                ]}
              />
            </Group>

            <Group title="Loader / sizes">
              <Loader size="sm" />
              <Loader size="md" />
              <Loader size="lg" label="Loading…" />
            </Group>

            <Group title="PriceTag (existing)">
              <PriceTag value={249} size="sm" />
              <PriceTag value={199} compareAt={299} size="md" />
              <PriceTag value={199} compareAt={299} size="lg" />
            </Group>

            <Group title="SkeletonCard">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, width: '100%' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </Group>

            <Group title="EmptyState">
              <EmptyState
                icon={<InboxIcon style={{ fontSize: 56 }} />}
                title="Your wishlist is empty"
                description="Save the pieces you love and they will appear here for easy access."
                cta={<AppButton variant="primary" to="/shop">Continue shopping</AppButton>}
              />
            </Group>

            <Group title="ErrorState">
              <ErrorState
                icon={<ErrorOutlineIcon style={{ fontSize: 56 }} />}
                title="We couldn't load this section"
                description="Please check your connection and retry. If the issue persists, contact support."
                onRetry={() => console.log('retry')}
              />
            </Group>

            <Group title="Form primitives (RHF)">
              <Stack>
                <FormDemo />
              </Stack>
            </Group>

            <Group title="AppDialog & AppDrawer">
              <AppButton variant="primary" onClick={() => setDialogOpen(true)}>
                Open dialog
              </AppButton>
              <AppButton variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open drawer
              </AppButton>
            </Group>

          </div>
        </Container>
      </Section>

      <AppDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm action"
        description="This is a sample confirmation dialog with primary and secondary actions."
        size="md"
        actions={
          <>
            <AppButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</AppButton>
            <AppButton variant="primary" onClick={() => setDialogOpen(false)}>Confirm</AppButton>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--color-ink-2)' }}>
          Place any content inside the dialog. Buttons live in the actions slot.
        </p>
      </AppDialog>

      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor="right"
        title="Filters"
        description="Refine your view"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <AppButton variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</AppButton>
            <AppButton variant="primary" onClick={() => setDrawerOpen(false)}>Apply</AppButton>
          </div>
        }
      >
        <Stack>
          <AppTextField label="Search" placeholder="Search products" />
          <AppCheckbox label="In stock only" />
          <AppCheckbox label="On sale" />
          <AppRadioGroup
            label="Sort"
            defaultValue="newest"
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'price-asc', label: 'Price: low to high' },
              { value: 'price-desc', label: 'Price: high to low' },
            ]}
          />
        </Stack>
      </AppDrawer>
    </>
  );
}

export default KitchenSink;
