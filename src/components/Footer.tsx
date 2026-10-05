import React from 'react';
import { Phone, MessageSquare, MapPin, Shield, AlertCircle } from 'lucide-react';
import { BusinessSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  business: BusinessSettings;
}

export const Footer: React.FC<FooterProps> = ({ business }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="no-print bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-10 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Business Identity */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              {language === 'bn' ? business.businessNameBn : business.businessNameEn}
            </h3>
            <p className="text-xs text-cyan-300 font-medium">
              {language === 'bn' ? business.businessNameEn : business.businessNameBn}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>{business.addressBn}</span>
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                {t.callNow}: <strong className="text-white">{business.phone}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                {t.whatsapp}: <strong className="text-white">{business.whatsapp}</strong>
              </span>
            </div>
          </div>

          {/* Column 2: Privacy Commitment */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-white font-semibold text-xs flex items-center gap-1.5 text-sky-300">
              <Shield className="w-4 h-4 text-sky-400" />
              {t.footerPrivacyTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.footerPrivacyText}
            </p>
            <p className="text-[11px] text-slate-400">
              {t.footerServerNote}
            </p>
          </div>

          {/* Column 3: Official Safety Disclaimer */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-white font-semibold text-xs flex items-center gap-1.5 text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              {t.footerSafetyTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.footerSafetyText}
            </p>
            <p className="text-[11px] text-slate-400">
              {t.footerEmbassyNote}
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {language === 'bn' ? business.businessNameBn : business.businessNameEn} | {t.footerAllRightsReserved}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">{t.footerIcaoFollowed}</span>
            <span>•</span>
            <span className="text-slate-400">{t.footerDpiExport}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
