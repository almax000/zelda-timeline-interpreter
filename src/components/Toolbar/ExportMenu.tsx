import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToPng, exportToPdf, exportToJson, importFromJson } from '../../utils/export';
import { encodeTimeline } from '../../utils/sharing';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';

export function ExportMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'too-large'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTabId = useTabStore((state) => state.activeTabId);
  const store = getCanvasStore(activeTabId);
  const { nodes, edges, loadTimeline } = store();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShareStatus('idle');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportPng = async () => {
    setIsOpen(false);
    await exportToPng();
  };

  const handleExportPdf = async () => {
    setIsOpen(false);
    await exportToPdf();
  };

  const handleExportJson = () => {
    setIsOpen(false);
    exportToJson(nodes, edges);
  };

  const handleShare = async () => {
    const url = encodeTimeline(nodes, edges);
    if (!url) {
      setShareStatus('too-large');
      setTimeout(() => setShareStatus('idle'), 3000);
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareStatus('copied');
    setTimeout(() => {
      setShareStatus('idle');
      setIsOpen(false);
    }, 1500);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importFromJson(file);
      loadTimeline(result.nodes, result.edges);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to import:', error);
    }

    event.target.value = '';
  };

  const itemClass = "w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1 text-sm bg-[var(--color-gold)] text-[var(--color-background)] rounded-md font-medium hover:bg-[var(--color-gold-light)] transition-colors"
      >
        {t('toolbar.export')} ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 z-50">
          <button onClick={handleExportPng} className={itemClass}>
            {t('toolbar.exportPNG')}
          </button>
          <button onClick={handleExportPdf} className={itemClass}>
            {t('toolbar.exportPDF')}
          </button>
          <button onClick={handleExportJson} className={itemClass}>
            {t('toolbar.exportJSON')}
          </button>
          <hr className="my-1 border-[var(--color-surface-light)]" />
          <button onClick={handleShare} className={itemClass}>
            {shareStatus === 'copied'
              ? t('toolbar.shareCopied')
              : shareStatus === 'too-large'
                ? 'Too large for URL — use JSON export'
                : t('toolbar.share')
            }
          </button>
          <hr className="my-1 border-[var(--color-surface-light)]" />
          <button onClick={handleImport} className={itemClass}>
            {t('toolbar.import')}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
