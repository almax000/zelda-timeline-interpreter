import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      language: 'en',
      coverRegion: 'us',
      snapToGrid: true,
    });
  });

  describe('initial state', () => {
    it('defaults to English and US region', () => {
      const { language, coverRegion } = useSettingsStore.getState();
      expect(language).toBe('en');
      expect(coverRegion).toBe('us');
    });

    it('defaults snapToGrid to true', () => {
      expect(useSettingsStore.getState().snapToGrid).toBe(true);
    });
  });

  describe('setLanguage', () => {
    it('auto-links language to cover region: en -> us', () => {
      useSettingsStore.getState().setLanguage('en');
      expect(useSettingsStore.getState().coverRegion).toBe('us');
    });

    it('auto-links language to cover region: ja -> jp', () => {
      useSettingsStore.getState().setLanguage('ja');
      expect(useSettingsStore.getState().language).toBe('ja');
      expect(useSettingsStore.getState().coverRegion).toBe('jp');
    });

    it('auto-links language to cover region: zh-CN -> us', () => {
      useSettingsStore.getState().setLanguage('zh-CN');
      expect(useSettingsStore.getState().coverRegion).toBe('us');
    });

    it('auto-links language to cover region: zh-TW -> us', () => {
      useSettingsStore.getState().setLanguage('zh-TW');
      expect(useSettingsStore.getState().coverRegion).toBe('us');
    });
  });

  describe('setCoverRegion', () => {
    it('sets cover region independently', () => {
      useSettingsStore.getState().setCoverRegion('jp');
      expect(useSettingsStore.getState().coverRegion).toBe('jp');
      expect(useSettingsStore.getState().language).toBe('en');
    });
  });

  describe('setSnapToGrid', () => {
    it('toggles snap to grid', () => {
      useSettingsStore.getState().setSnapToGrid(false);
      expect(useSettingsStore.getState().snapToGrid).toBe(false);
      useSettingsStore.getState().setSnapToGrid(true);
      expect(useSettingsStore.getState().snapToGrid).toBe(true);
    });
  });
});
