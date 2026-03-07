import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-[var(--color-gold)] mb-4">
          {t('about.title')}
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
          {t('about.text')}
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-background)] rounded-lg transition-colors"
          >
            {t('about.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
