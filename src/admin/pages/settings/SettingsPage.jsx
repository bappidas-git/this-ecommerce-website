import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Seo from '../../../components/common/Seo.jsx';
import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useCanAdminAccess from '../../hooks/useCanAdminAccess.js';
import { useToast } from '../../../context/ToastContext.jsx';

import useAdminSettings from '../../features/settings/useAdminSettings.js';
import { adminCategoryService } from '../../../api/services/admin/adminCategoryService.js';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';

import {
  GeneralTab,
  BrandingTab,
  HomepageTab,
  AnnouncementTab,
  PaymentTab,
  SocialTab,
  EmailsTab,
} from './SettingsTabs.jsx';

import styles from './SettingsPage.module.css';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'branding', label: 'Branding' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'payment', label: 'Payment' },
  { id: 'social', label: 'Social' },
  { id: 'emails', label: 'Emails' },
];

const VALID_TABS = new Set(TABS.map((t) => t.id));

function SettingsPage() {
  useAdminBreadcrumbs([{ label: 'Site' }, { label: 'Settings' }]);
  const { canWrite } = useCanAdminAccess('settings');
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.has(tabParam) ? tabParam : 'general';

  const setActiveTab = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams);
      if (next === 'general') {
        params.delete('tab');
      } else {
        params.set('tab', next);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const isLargeUp = useMediaQuery('(min-width: 1024px)');

  const { data, isLoading, error, isSaving, saveGroup } = useAdminSettings();

  const [topError, setTopError] = useState(null);

  // Reference data for homepage tab (categories + products)
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [cats, prods] = await Promise.all([
          adminCategoryService.list({ per_page: 200 }).catch(() => ({ items: [] })),
          adminProductService
            .list({ per_page: 200, sort_by: 'name', sort_dir: 'asc' })
            .catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        setCategoryOptions(
          (cats?.items || []).map((c) => ({ id: c.id, label: c.name })),
        );
        setProductOptions(
          (prods?.items || []).map((p) => ({
            id: p.id,
            label: p.name + (p.sku ? ` · ${p.sku}` : ''),
          })),
        );
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = useCallback(
    (group) => async (values) => {
      setTopError(null);
      try {
        await saveGroup(group, values);
        toast.success('Settings saved');
      } catch (err) {
        const msg = err?.message || 'Could not save settings.';
        setTopError(msg);
        toast.error(msg);
        throw err;
      }
    },
    [saveGroup, toast],
  );

  const tabContent = useMemo(() => {
    if (!data) return null;
    const common = { canWrite, isSaving, topError };
    switch (activeTab) {
      case 'branding':
        return (
          <BrandingTab
            initial={data.branding || {}}
            onSave={handleSave('branding')}
            {...common}
          />
        );
      case 'homepage':
        return (
          <HomepageTab
            initial={data.homepage || {}}
            onSave={handleSave('homepage')}
            categoryOptions={categoryOptions}
            productOptions={productOptions}
            loadingOptions={loadingOptions}
            {...common}
          />
        );
      case 'announcement':
        return (
          <AnnouncementTab
            initial={data.announcement || {}}
            onSave={handleSave('announcement')}
            {...common}
          />
        );
      case 'payment':
        return (
          <PaymentTab
            initial={data.payment || {}}
            onSave={handleSave('payment')}
            {...common}
          />
        );
      case 'social':
        return (
          <SocialTab
            initial={data.social || {}}
            onSave={handleSave('social')}
            {...common}
          />
        );
      case 'emails':
        return (
          <EmailsTab
            initial={data.emails || {}}
            onSave={handleSave('emails')}
            {...common}
          />
        );
      case 'general':
      default:
        return (
          <GeneralTab
            initial={data.general || {}}
            onSave={handleSave('general')}
            {...common}
          />
        );
    }
  }, [
    data,
    activeTab,
    canWrite,
    isSaving,
    topError,
    handleSave,
    categoryOptions,
    productOptions,
    loadingOptions,
  ]);

  return (
    <div className={styles.page}>
      <Seo title="Settings | Admin" noindex />
      <AdminPageHeader
        title="Settings"
        description="Configure storefront identity, payments, and the homepage."
      />

      {error ? (
        <div className={styles.skeleton} role="alert">
          Could not load settings — {error.message || 'please try again.'}
        </div>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.tabsRail}>
          <Tabs
            value={activeTab}
            onChange={(_e, v) => setActiveTab(v)}
            orientation={isLargeUp ? 'vertical' : 'horizontal'}
            variant={isLargeUp ? 'standard' : 'scrollable'}
            scrollButtons="auto"
            allowScrollButtonsMobile
            className={isLargeUp ? styles.tabsVertical : styles.tabsHorizontal}
            aria-label="Settings sections"
          >
            {TABS.map((t) => (
              <Tab
                key={t.id}
                value={t.id}
                label={t.label}
                className={styles.tab}
              />
            ))}
          </Tabs>
        </div>

        <div className={styles.formArea}>
          {isLoading && !data ? (
            <div className={styles.skeleton} aria-hidden />
          ) : (
            tabContent
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
