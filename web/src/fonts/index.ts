// Dynamically import all font files from public/fonts
const fontFiles = import.meta.glob('/public/fonts/*.{ttf,otf}', { eager: true, as: 'url' });

// Extract font names from file paths and create enum values
const fontEntries = Object.keys(fontFiles).map((path) => {
  const fileName = path.split('/').pop()!;
  const fontName = fileName.replace(/\.(ttf|otf)$/, '');
  // Convert kebab-case or regular names to PascalCase for enum keys
  const enumKey = fontName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return [enumKey, fontName] as const;
});

// Create Font enum dynamically
const Font = Object.fromEntries(fontEntries) as Record<string, string>;

// Load all fonts
Object.values(Font).forEach((fontName) => {
  const fontFile = Object.entries(fontFiles).find(([path]) => path.includes(fontName));
  if (fontFile) {
    const [, url] = fontFile;
    new FontFace(fontName, `url(${url})`).load().then((loadedFont) => document.fonts.add(loadedFont));
  }
});

export default Font;
