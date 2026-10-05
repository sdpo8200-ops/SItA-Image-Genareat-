import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacySafetyBadge: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {/* Privacy note */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50/80 border border-sky-100 text-sky-900 text-xs">
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        <p className="leading-tight">
          <strong>{t.privacyBadgeTitle}</strong> {t.privacyBadgeText}
        </p>
      </div>

      {/* Official photo safety */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="leading-tight">
          <strong>{t.safetyBadgeTitle}</strong> {t.safetyBadgeText}
        </p>
      </div>
    </div>
  );
};
