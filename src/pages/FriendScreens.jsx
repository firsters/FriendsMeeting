import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const FriendScreens = ({ onNavigate }) => {
  const { t } = useTranslation();

  const handleShareInvite = async () => {
    if (!auth.currentUser) return;

    try {
      let groupCode = '';
      // Try to fetch from Firestore first
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        groupCode = docSnap.data().groupCode;
      } else {
        // Fallback if not found (e.g. old user or firestore error)
        // In a real app we might generate one on the fly, but for now let's use a dummy or partial ID
        groupCode = auth.currentUser.uid.substring(0, 6).toUpperCase();
      }

      const link = `${window.location.origin}/?group_code=${groupCode}`;
      const shareData = {
        title: t('invite_title') || 'Join my Friend Group!',
        text: t('invite_text') || 'Join my group on FriendsMeeting!',
        url: link
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop: copy to clipboard
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard: ' + link);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-50">
       <button onClick={() => onNavigate(ScreenType.MAP)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">map</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_map')}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-primary">
         <span className="material-symbols-outlined">group</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_friends')}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">forum</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_meetings')}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">person</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_profile')}</span>
       </button>
    </nav>
  );

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">{t('nav_friends')}</h1>
          <div className="flex gap-2">
            <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </button>
            <button
              onClick={handleShareInvite}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
            placeholder={t('friends_search')} 
          />
        </div>
      </header>

      <main className="flex-1 px-6 overflow-y-auto scrollbar-hide pb-32">
        <section className="mb-8">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{t('friends_requests')} (2)</h3>
             <button className="text-[10px] font-bold text-primary uppercase">{t('meeting_view_all')}</button>
           </div>
           <div className="space-y-3">
             {[1, 2].map(i => (
               <div key={i} className="p-4 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center gap-4">
                 <img src={`https://picsum.photos/seed/${i + 20}/100/100`} className="w-12 h-12 rounded-full object-cover shadow-lg" alt="User" />
                 <div className="flex-1">
                   <p className="text-sm font-bold text-white leading-tight">Jason Kidd</p>
                   <p className="text-[10px] text-gray-500">2 {t('friends_mutual')}</p>
                 </div>
                 <div className="flex gap-2">
                   <button className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined text-sm">check</span></button>
                   <button className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-500"><span className="material-symbols-outlined text-sm">close</span></button>
                 </div>
               </div>
             ))}
           </div>
        </section>

        <section>
           <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">{t('friends_all')}</h3>
           <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all">
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/${i + 30}/100/100`} className="w-14 h-14 rounded-full object-cover shadow-2xl group-hover:ring-2 ring-primary/50 ring-offset-2 ring-offset-background-dark transition-all" alt="Friend" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-[3px] border-background-dark shadow-sm"></div>
                  </div>
                  <div className="flex-1 border-b border-white/5 py-4 group-last:border-none">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-base font-bold text-white">Jessica Pearson</h4>
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest italic font-sans">9m {t('friends_nearby_distance')}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{t('friends_location_sample')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">chat_bubble</span></button>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </main>

      {renderBottomNav()}
    </div>
  );
};

export default FriendScreens;
