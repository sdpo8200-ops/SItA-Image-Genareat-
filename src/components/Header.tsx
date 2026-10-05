import React from 'react';
import { Camera, Settings, Phone, MessageSquare, Globe } from 'lucide-react';
import { BusinessSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  business: BusinessSettings;
  onOpenSettings: () => void;
  onResetPhoto: () => void;
  hasPhoto: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  onOpenSettings,
  onResetPhoto,
  hasPhoto,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span>{business.businessNameEn}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/60 hidden xs:inline-block">
                  {t.aiStudioBadge}
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
              <span className="font-semibold text-sky-700 truncate">
                {language === 'bn' ? business.businessNameBn : business.businessNameEn}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {language === 'bn' ? business.subtitleBn : business.subtitleEn}
              </span>
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Contact Badges (Desktop) */}
          <div className="hidden xl:flex items-center gap-2.5 pr-2 border-r border-slate-200 text-xs">
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              title={t.callNow}
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-medium">{business.phone}</span>
            </a>
            <a
              href={`https://wa.me/88${business.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              title={t.whatsapp}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">{t.whatsapp}</span>
            </a>
          </div>

          {/* Language Switcher in Header */}
          <div
            className="flex items-center bg-slate-100/90 hover:bg-slate-200/70 p-0.5 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            role="group"
            aria-label="Language selection"
          >
            <div className="pl-1.5 pr-1 text-slate-500 hidden xs:flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="বাংলা ভাষায় দেখুন"
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to English"
            >
              English
            </button>
          </div>

          {/* New Photo Reset */}
          {hasPhoto && (
            <button
              onClick={onResetPhoto}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {t.newPhotoUpload}
            </button>
          )}

          {/* Business Settings Modal trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
            title={t.studioSettings}
          >
            <Settings className="w-4 h-4 text-sky-600" />
            <span className="hidden md:inline">{t.studioSettings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
