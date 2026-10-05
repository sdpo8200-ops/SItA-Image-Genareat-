import React, { useState } from 'react';
import { BusinessSettings } from '../types';
import { Settings, Save, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessSettings;
  onSaveBusinessSettings: (updated: BusinessSettings) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  business,
  onSaveBusinessSettings,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<BusinessSettings>({ ...business });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBusinessSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{t.settingsModalTitle}</h2>
              <p className="text-xs text-slate-500">{t.settingsModalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.fieldBnName}
            </label>
            <input
              type="text"
              value={formData.businessNameBn}
              onChange={(e) => setFormData({ ...formData, businessNameBn: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.fieldEnName}
            </label>
            <input
              type="text"
              value={formData.businessNameEn}
              onChange={(e) => setFormData({ ...formData, businessNameEn: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.fieldAddress}
            </label>
            <textarea
              value={formData.addressBn}
              onChange={(e) => setFormData({ ...formData, addressBn: e.target.value })}
              rows={2}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t.fieldPhone}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t.fieldWhatsapp}</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t.fieldFooter}</label>
            <input
              type="text"
              value={formData.footerTextBn}
              onChange={(e) => setFormData({ ...formData, footerTextBn: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? t.savedSuccessText : t.btnSave}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
