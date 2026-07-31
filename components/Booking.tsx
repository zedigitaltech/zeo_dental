import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/Button';
import { Reveal } from './ui/Reveal';
import { CheckCircle, MapPin, Phone, Mail, Upload, X, FileText, Image } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

const LANG_PHONE_PREFIX: Record<string, string> = {
  sq: '+355 ',
  en: '+44 ',
  it: '+39 ',
  de: '+49 ',
  fr: '+33 ',
  tr: '+90 ',
  el: '+30 ',
  es: '+34 ',
};

// Clinic contact constants
const CLINIC_PHONE = '+355684004840';
const CLINIC_PHONE_DISPLAY = '+355 68 400 4840';
const CLINIC_EMAIL = 'zeodentalclinic@gmail.com';
const CLINIC_ADDRESS = 'Rruga Hamdi Sina, Tiranë, Albania';
const GOOGLE_MAPS_URL = 'https://maps.google.com/?q=Rruga+Hamdi+Sina,+Tiranë,+Albania';

export const Booking: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const showDateTime = language === 'sq';

  // Pre-fill from ?package= query param (linked from PackagesPage)
  const packageParam = new URLSearchParams(window.location.search).get('package');
  const validPackages = ['essential', 'premium', 'vip'];
  const selectedPackage =
    packageParam && validPackages.includes(packageParam) ? packageParam : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: LANG_PHONE_PREFIX[language] || '',
    date: '',
    time: 'morning',
    description: selectedPackage ? t(`booking.packageTemplate.${selectedPackage}`) : '',
    honeypot: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [healthConsent, setHealthConsent] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_FILES = 3;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_SIZE) return false;
      return true;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot) return;

    // Require at least phone OR email
    if (!formData.phone && !formData.email) {
      setStatus('ERROR');
      return;
    }

    setStatus('SUBMITTING');

    const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

    try {
      const response = await fetch(`${API_BASE}/api/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date || undefined,
          time: formData.time || undefined,
          description: formData.description,
          service: selectedPackage
            ? `Package: ${selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)}`
            : 'General Consultation',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Booking error:', data.error || data.message);
        setStatus('ERROR');
        return;
      }

      // Upload files if present
      if (files.length > 0 && data.booking?.id) {
        try {
          const formData = new FormData();
          formData.append('healthDataConsent', String(healthConsent));
          files.forEach(f => formData.append('files', f));

          await fetch(`${API_BASE}/api/booking/${data.booking.id}/files`, {
            method: 'POST',
            body: formData,
          });
        } catch {
          // File upload failure doesn't block booking success
          console.warn('File upload failed, booking was still created');
        }
      }

      setStatus('SUCCESS');
      console.log('Booking created:', data.booking);
    } catch (error) {
      console.error('Booking submission error:', error);
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <section className="py-32 bg-studio-black text-white flex items-center justify-center">
        <div className="max-w-xl w-full mx-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-studio-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} className="text-studio-gold" />
            </div>
            <h3 className="text-4xl font-serif font-bold text-white mb-4">
              {t('booking.success')}
            </h3>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              {t('booking.successMessage').replace('{name}', formData.name)}
            </p>
            <button
              onClick={() => {
                setStatus('IDLE');
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  date: '',
                  time: 'morning',
                  description: '',
                  honeypot: '',
                });
                setFiles([]);
                setHealthConsent(false);
              }}
              className="text-[10px] uppercase tracking-ultra text-studio-gold hover:text-white transition-colors"
            >
              {t('booking.backToForm')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-32 bg-studio-black text-white relative overflow-hidden">
      {/* Abstract Background Shape */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <Reveal>
          <div className="flex flex-col lg:flex-row justify-between mb-24 gap-12">
            <div className="max-w-2xl">
              <span className="text-studio-gold text-[10px] uppercase tracking-ultra mb-6 md:mb-8 block font-semibold">
                {t('booking.label')}
              </span>
              <h2 className="font-serif text-5xl md:text-8xl mb-6 md:mb-8 leading-[0.9]">
                {t('booking.title1')} <br />
                <span className="italic font-light text-white/50">{t('booking.title2')}</span>
              </h2>
              <p className="text-white/60 font-light text-base md:text-lg leading-relaxed max-w-md">
                {t('booking.subtitle')}
              </p>
            </div>
            <div className="mt-auto text-left lg:text-right space-y-6 md:space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-studio-gold mb-2">
                  {t('booking.studioLabel')}
                </p>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-xl md:text-2xl text-white hover:text-studio-gold transition-colors inline-flex items-center gap-2 group"
                >
                  <MapPin className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('booking.address')}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-studio-gold mb-2">
                  {t('booking.phoneLabel')}
                </p>
                <a
                  href={`tel:${CLINIC_PHONE}`}
                  className="font-serif text-xl md:text-2xl text-white hover:text-studio-gold transition-colors inline-flex items-center gap-2 group"
                >
                  <Phone className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {CLINIC_PHONE_DISPLAY}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-studio-gold mb-2">
                  {t('booking.emailLabel')}
                </p>
                <a
                  href={`mailto:${CLINIC_EMAIL}`}
                  className="font-serif text-xl md:text-2xl text-white hover:text-studio-gold transition-colors inline-flex items-center gap-2 group"
                >
                  <Mail className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {CLINIC_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <form
            id="booking-form"
            className="w-full border-t border-white/10 pt-16"
            onSubmit={handleSubmit}
          >
            {/* Honeypot field */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              style={{ position: 'absolute', left: '-9999px' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
              <div className="group relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('booking.namePlaceholder')}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="group relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('booking.phonePlaceholder')}
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  {t('booking.phoneOrEmail')}
                </span>
              </div>
              <div className="group relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('booking.emailPlaceholder')}
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  {t('booking.optional')}
                </span>
              </div>
              <div className="group relative md:col-span-2 lg:col-span-3">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('booking.descriptionPlaceholder')}
                  rows={3}
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>
              {/* X-Ray / Photo Upload */}
              <div className="group relative md:col-span-2 lg:col-span-3">
                <label className="text-[10px] uppercase tracking-ultra text-white/40 mb-3 block">
                  {t('booking.uploadXray')}
                  <span className="ml-2 normal-case tracking-normal text-white/25">
                    {t('booking.optional')}
                  </span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-none py-8 px-6 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? 'border-studio-gold bg-studio-gold/5'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <Upload size={24} className="mx-auto mb-3 text-white/30" />
                  <p className="text-white/40 text-sm font-light">{t('booking.uploadHint')}</p>
                  <p className="text-white/20 text-xs mt-1">{t('booking.uploadFormats')}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    onChange={e => e.target.files && addFiles(e.target.files)}
                  />
                </div>

                {/* File previews */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {files.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center gap-2 bg-white/5 px-3 py-2 text-sm"
                      >
                        {file.type === 'application/pdf' ? (
                          <FileText size={16} className="text-studio-gold flex-shrink-0" />
                        ) : (
                          <Image size={16} className="text-studio-gold flex-shrink-0" />
                        )}
                        <span className="text-white/60 truncate max-w-[160px]">{file.name}</span>
                        <span className="text-white/25 text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="text-white/30 hover:text-red-400 transition-colors ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {showDateTime && (
                <>
                  <div className="group relative">
                    <label className="text-[10px] uppercase tracking-ultra text-black/40 mb-2 block">
                      {t('booking.date')}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="group relative">
                    <label className="text-[10px] uppercase tracking-ultra text-white/40 mb-2 block">
                      {t('booking.time')}
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                    >
                      <option value="morning" className="bg-studio-black">
                        {t('booking.morning')}
                      </option>
                      <option value="afternoon" className="bg-studio-black">
                        {t('booking.afternoon')}
                      </option>
                      <option value="evening" className="bg-studio-black">
                        {t('booking.evening')}
                      </option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-12 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentWhatsApp"
                  className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent text-studio-gold focus:ring-studio-gold"
                />
                <span className="text-sm text-white/60">{t('booking.consentWhatsApp')}</span>
              </label>
              {files.length > 0 && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthConsent}
                    onChange={e => setHealthConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent text-studio-gold focus:ring-studio-gold"
                    required
                  />
                  <span className="text-sm text-white/60">{t('booking.healthDataConsent')}</span>
                </label>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-8">
              <p className="text-xs text-white/40 max-w-xs">{t('booking.privacyNotice')}</p>
              <Button
                type="submit"
                variant="outline"
                className="!text-white !border-white hover:!bg-white hover:!text-black px-16 py-5 text-xs w-full md:w-auto disabled:opacity-50"
                data-cursor="hover"
                disabled={status === 'SUBMITTING'}
              >
                {status === 'SUBMITTING' ? t('booking.submitting') : t('booking.submit')}
              </Button>
            </div>

            {status === 'ERROR' && (
              <div className="mt-8 text-center text-red-400 text-sm">{t('booking.error')}</div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
};
