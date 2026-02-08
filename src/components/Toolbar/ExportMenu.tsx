import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToPng, exportToPdf, exportToJson, importFromJson } from '../../utils/export';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';

export function ExportMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTabId = useTabStore((state) => state.activeTabId);
  const store = getCanvasStore(activeTabId);
  const { nodes, edges, loadTimeline } = store();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
      alert('Failed to import timeline. Please check the file format.');
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm bg-[var(--color-gold)] text-[var(--color-background)] rounded-lg font-medium hover:bg-[var(--color-gold-light)] transition-colors"
      >
        {t('toolbar.export')} ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 z-50">
          <button
            onClick={handleExportPng}
            className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
          >
            {t('toolbar.exportPNG')}
          </button>
          <button
            onClick={handleExportPdf}
            className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
          >
            {t('toolbar.exportPDF')}
          </button>
          <button
            onClick={handleExportJson}
            className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
          >
            {t('toolbar.exportJSON')}
          </button>
          <hr className="my-1 border-[var(--color-surface-light)]" />
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
          >
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
