import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToPng, exportToPdf, exportToJson, importFromJson } from '../../utils/export';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ExportButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [importError, setImportError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTabId = useTabStore((state) => state.activeTabId);
  const store = getCanvasStore(activeTabId);
  const { nodes, edges, loadTimeline } = store();

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
    await exportToPng(nodes);
  };

  const handleExportPdf = async () => {
    setIsOpen(false);
    await exportToPdf(nodes);
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
      setImportError(false);
      const result = await importFromJson(file);
      loadTimeline(result.nodes, result.edges);
      setIsOpen(false);
    } catch {
      setImportError(true);
      setTimeout(() => setImportError(false), 3000);
    }

    event.target.value = '';
  };

  const itemClass = "w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]";

  return (
    <div ref={menuRef} className="relative pointer-events-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1 text-sm rounded-lg font-medium flex items-center gap-1.5 bg-[var(--color-gold)] text-[var(--color-background)] hover:bg-[var(--color-gold-light)] transition-colors shadow-lg"
      >
        <IconDownload />
        {t('toolbar.export')}
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
          <button onClick={handleImport} className={itemClass}>
            {t('toolbar.import')}
          </button>
          {importError && (
            <div className="px-4 py-1.5 text-xs text-red-400">
              {t('toolbar.importError')}
            </div>
          )}
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