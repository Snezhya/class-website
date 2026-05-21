import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_BRAND } from '../../constants/brand';

/** Sinkronkan favicon & title browser dari pengaturan admin */
export const SiteBranding: React.FC = () => {
  const { settings } = useApp();

  useEffect(() => {
    const title = settings.brandTitle || DEFAULT_BRAND.brandTitle;
    const subtitle = settings.brandSubtitle || DEFAULT_BRAND.brandSubtitle;
    document.title = `${title} — ${subtitle}`;

    const href = settings.logoFavicon || DEFAULT_BRAND.logoFavicon;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
    link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  }, [
    settings.logoFavicon,
    settings.brandTitle,
    settings.brandSubtitle,
  ]);

  return null;
};
