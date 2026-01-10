import { useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useTranslation } from '../context/LanguageContext';

const VersionGuard = () => {
  const { showConfirm } = useModal();
  const { t } = useTranslation();

  useEffect(() => {
    // Check for updates every 10 minutes
    const CHECK_INTERVAL = 10 * 60 * 1000;
    
    const checkForUpdates = async () => {
      try {
        // Fetch version.json from root with cache-busting
        const response = await fetch(`/version.json?v=${Date.now()}`);
        if (!response.ok) return;
        
        const data = await response.json();
        const latestVersion = data.version;
        
        // APP_VERSION is injected via Vite define
        const currentVersion = typeof APP_VERSION !== 'undefined' ? APP_VERSION : null;

        if (currentVersion && latestVersion && currentVersion !== latestVersion) {
            console.log(`[VersionGuard] NEW VERSION DETECTED: ${currentVersion} -> ${latestVersion}`);
            
            showConfirm(
              t('update_available_msg') || "새로운 버전이 출시되었습니다. 최신 기능을 사용하시려면 페이지를 새로고침 하시겠습니까?",
              () => {
                window.location.reload(true);
              },
              null,
              t('update_available_title') || "업데이트 안내",
              t('update_now') || "지금 업데이트",
              t('later') || "나중에"
            );
        }
      } catch (err) {
        console.warn('[VersionGuard] Failed to fetch version info:', err);
      }
    };

    // Initial check after mount (wait 5s for app to stabilize)
    const timeout = setTimeout(checkForUpdates, 5000);
    
    const interval = setInterval(checkForUpdates, CHECK_INTERVAL);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [showConfirm, t]);

  return null;
};

export default VersionGuard;
