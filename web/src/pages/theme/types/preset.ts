type PresetOptionValue = string | number | boolean;

type ThemePreset = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  themeName: string;
  notCroppedMode: boolean;
  options: Record<string, PresetOptionValue>;
};

type PresetFilePayload = {
  version: 1;
  presets: ThemePreset[];
};

export type { PresetOptionValue, ThemePreset, PresetFilePayload };
