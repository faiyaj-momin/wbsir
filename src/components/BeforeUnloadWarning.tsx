import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function BeforeUnloadWarning() {
  const { t } = useLanguage();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t(
        'You have unsaved changes. Are you sure you want to leave?',
        'আপনার অসংরক্ষিত পরিবর্তন রয়েছে। আপনি কি নিশ্চিত যে আপনি চলে যেতে চান?'
      );
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [t]);

  return null;
}
