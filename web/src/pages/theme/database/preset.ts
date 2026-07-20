import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import themes from '../../../themes';
import { useStore } from '../../../store';
import Customize from './customize';
import { getConverter } from '../types/theme-option';
import type { PresetFilePayload, PresetOptionValue, ThemePreset } from '../types/preset';

const STORAGE_KEY = 'themePresets';
const FILE_VERSION = 1 as const;

class Preset {
  private constructor() {}

  static list(): ThemePreset[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as ThemePreset[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item.id === 'string' && typeof item.themeName === 'string')
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  private static saveAll(presets: ThemePreset[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }

  static get(id: string): ThemePreset | null {
    return this.list().find((preset) => preset.id === id) ?? null;
  }

  static captureCurrent(name: string): ThemePreset {
    const store = useStore.getState();
    const themeName = store.selectedThemeName;
    const theme = themes.find((item) => item.name === themeName);
    const options: Record<string, PresetOptionValue> = {};

    theme?.options.forEach((option) => {
      const saved = Customize.get(themeName, option.id, getConverter(option.type));
      options[option.id] = saved !== null ? saved : option.default;
    });

    const now = Date.now();
    return {
      id: crypto.randomUUID(),
      name: name.trim() || themeName,
      createdAt: now,
      updatedAt: now,
      themeName,
      notCroppedMode: store.notCroppedMode,
      options,
    };
  }

  static create(name: string): ThemePreset {
    const preset = this.captureCurrent(name);
    const presets = this.list();
    presets.unshift(preset);
    this.saveAll(presets);
    return preset;
  }

  static update(id: string, patch: Partial<Pick<ThemePreset, 'name'>> & { refreshFromCurrent?: boolean }): ThemePreset | null {
    const presets = this.list();
    const index = presets.findIndex((preset) => preset.id === id);
    if (index < 0) return null;

    const current = presets[index];
    let next: ThemePreset = {
      ...current,
      name: patch.name?.trim() || current.name,
      updatedAt: Date.now(),
    };

    if (patch.refreshFromCurrent) {
      const captured = this.captureCurrent(next.name);
      next = {
        ...captured,
        id: current.id,
        name: next.name,
        createdAt: current.createdAt,
      };
    }

    presets[index] = next;
    this.saveAll(presets);
    return next;
  }

  static remove(id: string): void {
    this.saveAll(this.list().filter((preset) => preset.id !== id));
  }

  static apply(id: string): boolean {
    const preset = this.get(id);
    if (!preset) return false;

    const theme = themes.find((item) => item.name === preset.themeName);
    if (!theme) return false;

    const store = useStore.getState();
    store.setSelectedThemeName(preset.themeName);
    store.setNotCroppedMode(preset.notCroppedMode);

    theme.options.forEach((option) => {
      Customize.delete(preset.themeName, option.id);
      const value = preset.options[option.id];
      if (value !== undefined) {
        Customize.set(preset.themeName, option.id, value);
      }
    });

    // Persist options that may exist in the preset but not in current theme schema (forward-compat).
    Object.entries(preset.options).forEach(([key, value]) => {
      if (!theme.options.some((option) => option.id === key)) {
        Customize.set(preset.themeName, key, value);
      }
    });

    store.setRerenderOptions();
    return true;
  }

  static toFilePayload(presets: ThemePreset[]): PresetFilePayload {
    return { version: FILE_VERSION, presets };
  }

  static serialize(presets: ThemePreset[], format: 'json' | 'yaml'): string {
    const payload = this.toFilePayload(presets);
    if (format === 'yaml') {
      return yamlDump(payload, { indent: 2, lineWidth: 120, noRefs: true });
    }
    return `${JSON.stringify(payload, null, 2)}\n`;
  }

  static parseFile(content: string): ThemePreset[] {
    const trimmed = content.trim();
    if (!trimmed) return [];

    let data: unknown;
    try {
      data = trimmed.startsWith('{') || trimmed.startsWith('[') ? JSON.parse(trimmed) : yamlLoad(trimmed);
    } catch {
      throw new Error('INVALID_PRESET_FILE');
    }

    const normalize = (item: unknown): ThemePreset | null => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      if (typeof record.themeName !== 'string' || typeof record.name !== 'string') return null;
      if (!record.options || typeof record.options !== 'object') return null;

      const now = Date.now();
      return {
        id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
        name: record.name,
        createdAt: typeof record.createdAt === 'number' ? record.createdAt : now,
        updatedAt: typeof record.updatedAt === 'number' ? record.updatedAt : now,
        themeName: record.themeName,
        notCroppedMode: Boolean(record.notCroppedMode),
        options: record.options as Record<string, PresetOptionValue>,
      };
    };

    if (Array.isArray(data)) {
      return data.map(normalize).filter((item): item is ThemePreset => item !== null);
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.presets)) {
        return record.presets.map(normalize).filter((item): item is ThemePreset => item !== null);
      }
      const single = normalize(data);
      return single ? [single] : [];
    }

    return [];
  }

  static importFromFile(content: string): ThemePreset[] {
    const imported = this.parseFile(content);
    if (imported.length === 0) throw new Error('EMPTY_PRESET_FILE');

    const now = Date.now();
    const copies = imported.map((preset, index) => ({
      ...preset,
      id: crypto.randomUUID(),
      createdAt: now + index,
      updatedAt: now + index,
    }));

    this.saveAll([...copies, ...this.list()]);
    return copies;
  }
}

export default Preset;
