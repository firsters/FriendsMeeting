import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from '../context/LanguageContext';

const ReloadPrompt = () => {
    const { t } = useTranslation();
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">system_update</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">
                            {t('update_available_title') || "Update Available"}
                        </h3>
                        <p className="text-gray-300 text-xs">
                            {t('update_available_msg') || "New version available! Click update to reload."}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => close()}
                        className="px-4 py-2 rounded-lg text-gray-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {t('later') || "Later"}
                    </button>
                    <button 
                        onClick={() => updateServiceWorker(true)}
                        className="px-4 py-2 bg-primary rounded-lg text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors"
                    >
                        {t('update_now') || "Update Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReloadPrompt;
