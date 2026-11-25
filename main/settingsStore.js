import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeSettings } from '../renderer/js/core/DefaultSettings.js';

export class SettingsStore {
  constructor(filePath) { this.filePath = filePath; }
  load() {
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid settings');
      const settings = normalizeSettings(parsed);
      this.save(settings);
      return settings;
    } catch (error) {
      if (error.code !== 'ENOENT') console.warn('Settings reset to defaults:', error.message);
      return this.save({});
    }
  }
  save(input) {
    const settings = normalizeSettings(input);
    writeFileSync(this.filePath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
    return settings;
  }
}
